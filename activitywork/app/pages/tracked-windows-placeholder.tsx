"use client";

import * as React from "react";

import { CardDescription } from "@/components/ui/card";
import { buildAwPreviewQueryString } from "@/lib/aw-source-preferences-query";
import {
    TrackedWindowsTable,
    type TrackedWindowRow,
} from "@/components/tracked-windows-table";

const CATALOG_SYNC_INTERVAL_MS = 60_000;

type CatalogAppRow = {
    appName: string;
    firstSeenAt: string;
    lastSeenAt: string;
    lastTitle: string;
    ignored: boolean;
};

type CatalogResponse = {
    ok: boolean;
    apps?: CatalogAppRow[];
    error?: string;
};

type SyncResponse = CatalogResponse & {
    merge?: {
        inserted: number;
        updated: number;
        skippedInvalid: number;
    };
};

function rowsFromCatalogApps(apps: CatalogAppRow[]): TrackedWindowRow[] {
    return apps.map((app, i) => ({
        rowKey: app.appName,
        index: i + 1,
        appName: app.appName,
        lastTitle: app.lastTitle,
        ignored: app.ignored,
    }));
}

export function TrackedWindowsPlaceholder() {
    const [rows, setRows] = React.useState<TrackedWindowRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [syncing, setSyncing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [busyAppName, setBusyAppName] = React.useState<string | null>(null);
    const loadInFlightRef = React.useRef(false);
    const syncInFlightRef = React.useRef(false);
    const visibleRef = React.useRef(
        typeof document === "undefined" ? true : !document.hidden,
    );

    const applyCatalogJson = React.useCallback((json: CatalogResponse) => {
        if (!json.ok || !json.apps) {
            setRows([]);
            setError(json.error ?? "Failed to load app catalog");
            return;
        }
        setError(null);
        setRows(rowsFromCatalogApps(json.apps));
    }, []);

    const loadCatalog = React.useCallback(async () => {
        if (loadInFlightRef.current) return;
        loadInFlightRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/apps/catalog");
            const json = (await response.json()) as CatalogResponse;
            if (!response.ok || !json.ok) {
                applyCatalogJson({
                    ok: false,
                    error: json.error ?? `Request failed (${response.status})`,
                });
                return;
            }
            applyCatalogJson(json);
        } catch (e) {
            setRows([]);
            setError(
                e instanceof Error ? e.message : "Failed to load app catalog",
            );
        } finally {
            loadInFlightRef.current = false;
            setLoading(false);
        }
    }, [applyCatalogJson]);

    const syncFromActivityWatch = React.useCallback(async () => {
        if (syncInFlightRef.current) return;
        syncInFlightRef.current = true;
        setSyncing(true);
        try {
            const qs = buildAwPreviewQueryString({ eventLimit: 400 });
            const path = qs
                ? `/api/apps/catalog/sync?${qs}`
                : "/api/apps/catalog/sync";
            const response = await fetch(path, { method: "POST" });
            const json = (await response.json()) as SyncResponse;

            if (!response.ok || !json.ok) {
                setError(
                    json.error ??
                        `ActivityWatch sync failed (${response.status})`,
                );
                return;
            }
            setError(null);
            if (json.apps) {
                setRows(rowsFromCatalogApps(json.apps));
            }
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to sync from ActivityWatch",
            );
        } finally {
            syncInFlightRef.current = false;
            setSyncing(false);
        }
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        async function boot() {
            await loadCatalog();
            if (cancelled) return;
            await syncFromActivityWatch();
        }

        void boot();

        return () => {
            cancelled = true;
        };
    }, [loadCatalog, syncFromActivityWatch]);

    React.useEffect(() => {
        const onVisibility = () => {
            visibleRef.current = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    React.useEffect(() => {
        const id = window.setInterval(() => {
            if (!visibleRef.current) return;
            void syncFromActivityWatch();
        }, CATALOG_SYNC_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [syncFromActivityWatch]);

    React.useEffect(() => {
        function onStorage() {
            void loadCatalog();
            void syncFromActivityWatch();
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [loadCatalog, syncFromActivityWatch]);

    const onSetIgnored = React.useCallback(
        async (appName: string, ignored: boolean) => {
            setBusyAppName(appName);
            try {
                if (ignored) {
                    const res = await fetch("/api/apps/ignore", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ appName }),
                    });
                    const json = (await res.json()) as {
                        ok?: boolean;
                        error?: string;
                    };
                    if (!res.ok || !json.ok) {
                        setError(
                            json.error ??
                                `Could not ignore app (${res.status})`,
                        );
                        return;
                    }
                } else {
                    const qs = new URLSearchParams({ appName });
                    const res = await fetch(`/api/apps/ignore?${qs}`, {
                        method: "DELETE",
                    });
                    const json = (await res.json()) as {
                        ok?: boolean;
                        error?: string;
                    };
                    if (!res.ok || !json.ok) {
                        setError(
                            json.error ??
                                `Could not unignore app (${res.status})`,
                        );
                        return;
                    }
                }
                setError(null);
                await loadCatalog();
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "Ignore request failed",
                );
            } finally {
                setBusyAppName(null);
            }
        },
        [loadCatalog],
    );

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <CardDescription className="text-pretty px-0">
                        All applications ActivityWork has ever seen from your
                        ActivityWatch buckets (merged over time), using the same
                        source settings as the live feed. The list loads from
                        the local database first, then syncs from ActivityWatch
                        about every minute while this tab is visible.
                        {syncing ? (
                            <span className="mt-1 block text-xs text-muted-foreground">
                                Syncing with ActivityWatch…
                            </span>
                        ) : null}
                    </CardDescription>
                </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {loading && rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                ) : null}
                {error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
                {!loading && !error && rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No applications recorded yet. Ensure ActivityWatch is
                        running, open the live feed or wait for the next sync,
                        and confirm buckets under Plugin settings.
                    </p>
                ) : null}
                {rows.length > 0 ? (
                    <TrackedWindowsTable
                        rows={rows}
                        onSetIgnored={onSetIgnored}
                        busyAppName={busyAppName}
                    />
                ) : null}
            </div>
        </div>
    );
}
