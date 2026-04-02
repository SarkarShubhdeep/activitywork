import type { ActivityWatchEvent } from "@/lib/activitywatch-client";

function asString(value: unknown) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/** Aligns with preview-console `normalizeEvent` app / title extraction. */
export function appNameFromEventData(data: Record<string, unknown>) {
    return (
        asString(data.app) ??
        asString(data["app_name"]) ??
        asString(data["browser"]) ??
        null
    );
}

export function titleFromEventData(data: Record<string, unknown>, fallbackApp: string) {
    return (
        asString(data.title) ??
        asString(data["window_title"]) ??
        asString(data["tab_title"]) ??
        asString(data.url) ??
        fallbackApp
    );
}

export type AggregatedTrackedApp = {
    appName: string;
    lastTitle: string;
    lastSeenAtMs: number;
};

type EventWithTs = ActivityWatchEvent & { timestamp?: string };

/**
 * One entry per distinct app name, keeping the title from the most recent event.
 */
export function aggregateUniqueAppsFromEvents(
    events: EventWithTs[],
): AggregatedTrackedApp[] {
    const best = new Map<
        string,
        { lastTitle: string; lastSeenAtMs: number }
    >();

    for (const event of events) {
        const data = event.data ?? {};
        const app =
            appNameFromEventData(data as Record<string, unknown>) ?? "unknown";
        const lastTitle = titleFromEventData(
            data as Record<string, unknown>,
            app,
        );
        const ts = event.timestamp
            ? new Date(event.timestamp).getTime()
            : 0;
        const lastSeenAtMs = Number.isFinite(ts) ? ts : 0;

        const prev = best.get(app);
        if (!prev || lastSeenAtMs >= prev.lastSeenAtMs) {
            best.set(app, { lastTitle, lastSeenAtMs });
        }
    }

    return [...best.entries()]
        .map(([appName, v]) => ({
            appName,
            lastTitle: v.lastTitle,
            lastSeenAtMs: v.lastSeenAtMs,
        }))
        .sort((a, b) => a.appName.localeCompare(b.appName, undefined, { sensitivity: "base" }));
}
