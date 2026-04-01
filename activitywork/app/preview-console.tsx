"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type BucketInfo = {
    id: string;
    type?: string;
    client?: string;
    hostname?: string;
};

type PreviewResponse = {
    ok: boolean;
    bucketId?: string;
    bucketCount?: number;
    buckets?: BucketInfo[];
    eventCount?: number;
    latestEventAt?: string | null;
    sample?: unknown[];
    error?: string;
};

type BucketMode = "auto" | "default" | "manual";
type WatcherCategory = "window" | "web" | "vscode" | "afk";
type SourcePreferences = {
    bucketMode: BucketMode;
    manualBucketId: string | null;
    watcherFilters: Record<WatcherCategory, boolean>;
};

type ActivityEvent = {
    id?: number;
    timestamp?: string;
    duration?: number;
    data?: Record<string, unknown>;
    bucketId?: string;
    watcher?: WatcherCategory | "unknown";
};

type NormalizedFeedEvent = {
    id: string;
    title: string;
    durationSeconds: number;
    durationLabel: string;
    startedAt: string;
    startedAtMs: number;
    app: string;
    url: string | null;
    category: string;
    watcher: WatcherCategory | "unknown";
};

const DEFAULT_SOURCE_PREFERENCES: SourcePreferences = {
    bucketMode: "auto",
    manualBucketId: null,
    watcherFilters: {
        window: true,
        web: true,
        vscode: true,
        afk: true,
    },
};

function toDurationLabel(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0s";
    }

    const total = Math.floor(seconds);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
        return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
}

function toTimestampLabel(value: string | undefined) {
    if (!value) return "n/a";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function asString(value: unknown) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeEvent(
    raw: ActivityEvent,
    index: number,
    watcher: WatcherCategory | "unknown",
): NormalizedFeedEvent {
    const data = raw.data ?? {};
    const app =
        asString(data.app) ??
        asString(data["app_name"]) ??
        asString(data["browser"]) ??
        "unknown";
    const title =
        asString(data.title) ??
        asString(data["window_title"]) ??
        asString(data["tab_title"]) ??
        asString(data.url) ??
        app;
    const category =
        asString(data["$category"]) ??
        asString(data.category) ??
        asString(data["bucket"]) ??
        "activity";
    const url = asString(data.url) ?? asString(data["current_url"]);
    const durationSeconds =
        typeof raw.duration === "number" && Number.isFinite(raw.duration)
            ? raw.duration
            : 0;

    const startedAtMs = raw.timestamp ? new Date(raw.timestamp).getTime() : 0;

    return {
        id: String(raw.id ?? `${raw.timestamp ?? "event"}-${index}`),
        title,
        durationSeconds,
        durationLabel: toDurationLabel(durationSeconds),
        startedAt: toTimestampLabel(raw.timestamp),
        startedAtMs: Number.isFinite(startedAtMs) ? startedAtMs : 0,
        app,
        url,
        category,
        watcher,
    };
}

function parseWatcherFromBucketId(
    bucketId: string | undefined,
): WatcherCategory | "unknown" {
    if (!bucketId) return "unknown";
    const lowerId = bucketId.toLowerCase();
    if (lowerId.includes("aw-watcher-window")) return "window";
    if (lowerId.includes("aw-watcher-web")) return "web";
    if (lowerId.includes("aw-watcher-vscode")) return "vscode";
    if (lowerId.includes("aw-watcher-afk")) return "afk";
    return "unknown";
}

function readSourcePreferences(): SourcePreferences {
    try {
        const raw = localStorage.getItem("aw-source-preferences");
        if (!raw) return DEFAULT_SOURCE_PREFERENCES;

        const parsed = JSON.parse(raw) as Partial<{
            bucketMode: BucketMode;
            manualBucketId: string | null;
            watcherFilters: Partial<Record<WatcherCategory, boolean>>;
        }>;

        const bucketMode =
            parsed.bucketMode === "auto" ||
            parsed.bucketMode === "default" ||
            parsed.bucketMode === "manual"
                ? parsed.bucketMode
                : DEFAULT_SOURCE_PREFERENCES.bucketMode;

        const manualBucketId =
            typeof parsed.manualBucketId === "string" &&
            parsed.manualBucketId.trim().length > 0
                ? parsed.manualBucketId.trim()
                : null;

        return {
            bucketMode,
            manualBucketId,
            watcherFilters: {
                ...DEFAULT_SOURCE_PREFERENCES.watcherFilters,
                ...(parsed.watcherFilters ?? {}),
            },
        };
    } catch {
        return DEFAULT_SOURCE_PREFERENCES;
    }
}

export function PreviewConsole() {
    const [data, setData] = useState<PreviewResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sourcePreferences, setSourcePreferences] = useState<SourcePreferences>(
        DEFAULT_SOURCE_PREFERENCES,
    );
    const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
        null,
    );
    const knownEventIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        function refreshPreferences() {
            const nextPreferences = readSourcePreferences();
            setSourcePreferences(nextPreferences);
        }

        refreshPreferences();
        window.addEventListener("storage", refreshPreferences);

        return () => {
            window.removeEventListener("storage", refreshPreferences);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        let lastSeenTimestamp: string | null = null;

        async function loadPreview() {
            try {
                const prefs = readSourcePreferences();
                setSourcePreferences(prefs);

                const params = new URLSearchParams();
                const bucketMode = prefs.bucketMode;

                if (bucketMode === "manual" && prefs.manualBucketId) {
                    params.set("bucketId", prefs.manualBucketId);
                }
                if (bucketMode === "auto") {
                    const enabledWatchers = (
                        Object.entries(prefs.watcherFilters) as Array<
                            [WatcherCategory, boolean]
                        >
                    )
                        .filter(([, enabled]) => enabled)
                        .map(([watcher]) => watcher);
                    if (enabledWatchers.length > 0) {
                        params.set(
                            "watcherCategories",
                            enabledWatchers.join(","),
                        );
                    }
                }

                const query = params.toString();
                const response = await fetch(
                    query ? `/api/aw/preview?${query}` : "/api/aw/preview",
                );
                const json = (await response.json()) as PreviewResponse;

                if (!isMounted) {
                    return;
                }

                if (
                    json.latestEventAt &&
                    json.latestEventAt !== lastSeenTimestamp
                ) {
                    console.log("ActivityWatch live update:", json);
                    lastSeenTimestamp = json.latestEventAt;
                }

                setData(json);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load preview";
                console.error("Failed to fetch ActivityWatch preview:", err);

                if (isMounted) {
                    setError(message);
                }
            }
        }

        void loadPreview();
        const intervalId = setInterval(() => {
            void loadPreview();
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const normalizedFeed = ((data?.sample ?? []) as ActivityEvent[])
        .map((event, index) =>
            normalizeEvent(
                event,
                index,
                event.watcher ??
                    parseWatcherFromBucketId(event.bucketId ?? data?.bucketId),
            ),
        )
        .filter((event) =>
            event.watcher === "unknown"
                ? true
                : sourcePreferences.watcherFilters[event.watcher],
        )
        .sort((a, b) => b.startedAtMs - a.startedAtMs);

    useEffect(() => {
        if (normalizedFeed.length === 0) return;

        const currentIds = normalizedFeed.map((event) => event.id);
        const knownIds = knownEventIdsRef.current;
        const justArrived = currentIds.filter((id) => !knownIds.has(id));

        if (knownIds.size === 0) {
            knownEventIdsRef.current = new Set(currentIds);
            return;
        }

        if (justArrived.length > 0) {
            // Feed is already newest-first, so first match is the newest incoming event.
            const newestIncomingId = normalizedFeed.find((event) =>
                justArrived.includes(event.id),
            )?.id;
            const highlightTimeoutId = setTimeout(() => {
                if (newestIncomingId) {
                    setHighlightedEventId(newestIncomingId);
                }
            }, 0);
            const clearTimeoutId = setTimeout(() => {
                setHighlightedEventId((current) =>
                    current === newestIncomingId ? null : current,
                );
            }, 500);

            knownEventIdsRef.current = new Set(currentIds);
            return () => {
                clearTimeout(highlightTimeoutId);
                clearTimeout(clearTimeoutId);
            };
        }

        knownEventIdsRef.current = new Set(currentIds);
    }, [normalizedFeed]);

    if (error) {
        return (
            <p className="text-sm text-destructive">
                {`Preview failed: ${error}`}
            </p>
        );
    }

    if (!data) {
        return (
            <p className="text-sm text-muted-foreground">Loading preview…</p>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 text-sm text-foreground">
            <div className="flex shrink-0 flex-wrap gap-2">
                <Badge variant="outline" className="font-normal">
                    {`bucketId: ${data.bucketId ?? "n/a"}`}
                </Badge>
                <Badge variant="outline" className="font-normal">
                    {`events: ${data.eventCount ?? 0}`}
                </Badge>
                <Badge variant="outline" className="font-normal">
                    {`latest: ${data.latestEventAt ?? "n/a"}`}
                </Badge>
                <Badge variant="outline" className="font-normal">
                    {`watchers: ${data.bucketCount ?? 0}`}
                </Badge>
            </div>

            <ScrollArea className="max-h-[600px] rounded-md border border-border">
                <div className="h-full space-y-2 p-3">
                    {normalizedFeed.length > 0 ? (
                        normalizedFeed.map((event) => (
                            <div key={event.id} className="relative">
                                {highlightedEventId === event.id ? (
                                    <span
                                        className="absolute top-2 right-2 size-2.5 rounded-full bg-primary"
                                        aria-label="New event"
                                        title="New event"
                                    />
                                ) : null}
                                <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs leading-5">
                                    {JSON.stringify(event, null, 2)}
                                </pre>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            No events in preview sample yet.
                        </p>
                    )}
                </div>
            </ScrollArea>

            <p className="shrink-0 text-xs text-muted-foreground">
                This panel refreshes automatically every 5 seconds.
            </p>
            <p className="shrink-0 text-xs text-muted-foreground">
                Polling every 5 seconds with source selection preferences
                applied.
            </p>
        </div>
    );
}
