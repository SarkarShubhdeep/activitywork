"use client";

import * as React from "react";

import { CardDescription } from "@/components/ui/card";
import { buildAwPreviewQueryString } from "@/lib/aw-source-preferences-query";
import {
    TrackedWindowsTable,
    type TrackedWindowRow,
} from "@/components/tracked-windows-table";

type TrackedAppsResponse = {
    ok: boolean;
    apps?: Array<{
        appName: string;
        lastTitle: string;
        lastSeenAtMs: number;
    }>;
    error?: string;
};

function rowsFromApiApps(
    apps: NonNullable<TrackedAppsResponse["apps"]>,
): TrackedWindowRow[] {
    return apps.map((app, i) => ({
        rowKey: `${i}-${app.appName}`,
        index: i + 1,
        appName: app.appName,
        lastTitle: app.lastTitle,
    }));
}

export function TrackedWindowsPlaceholder() {
    const [rows, setRows] = React.useState<TrackedWindowRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const qs = buildAwPreviewQueryString({ eventLimit: 400 });
                const url = qs
                    ? `/api/aw/tracked-apps?${qs}`
                    : "/api/aw/tracked-apps";
                const response = await fetch(url);
                const json = (await response.json()) as TrackedAppsResponse;

                if (cancelled) return;

                if (!response.ok || !json.ok) {
                    setRows([]);
                    setError(json.error ?? `Request failed (${response.status})`);
                    return;
                }

                const next = json.apps?.length
                    ? rowsFromApiApps(json.apps)
                    : [];
                setRows(next);
            } catch (e) {
                if (!cancelled) {
                    setRows([]);
                    setError(
                        e instanceof Error ? e.message : "Failed to load tracked apps",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();
        const id = window.setInterval(() => {
            void load();
        }, 5000);

        function onStorage() {
            void load();
        }
        window.addEventListener("storage", onStorage);

        return () => {
            cancelled = true;
            window.clearInterval(id);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <CardDescription className="text-pretty px-0">
                        Applications seen in your ActivityWatch buckets (last ~10
                        minutes of events), using the same source settings as the
                        live feed. Refreshes every 5 seconds.
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
                        No applications found in the recent ActivityWatch event
                        window. Ensure ActivityWatch is running and buckets are
                        selected under Plugin settings.
                    </p>
                ) : null}
                {rows.length > 0 ? (
                    <TrackedWindowsTable rows={rows} />
                ) : null}
            </div>
        </div>
    );
}
