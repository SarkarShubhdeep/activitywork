"use client";

import * as React from "react";
import { usePanelRef } from "react-resizable-panels";

import { PreviewConsole } from "./preview-console";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

const triggerClass =
    "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

type BucketMode = "auto" | "default" | "manual";
type WatcherCategory = "window" | "web" | "vscode" | "afk";

const watcherCategories: Array<{
    id: WatcherCategory;
    label: string;
    description: string;
}> = [
    {
        id: "window",
        label: "Window",
        description: "Desktop window events",
    },
    {
        id: "web",
        label: "Web",
        description: "Browser tab/url events",
    },
    {
        id: "vscode",
        label: "VS Code",
        description: "Coding editor events",
    },
    {
        id: "afk",
        label: "AFK",
        description: "Idle/away activity events",
    },
];

export function HomeShell() {
    const feedPanelRef = usePanelRef();
    const [feedOpen, setFeedOpen] = React.useState(false);
    const [bucketMode, setBucketMode] = React.useState<BucketMode>("auto");
    const [watcherFilters, setWatcherFilters] = React.useState<
        Record<WatcherCategory, boolean>
    >({
        window: true,
        web: true,
        vscode: true,
        afk: true,
    });
    const [manualBucketId, setManualBucketId] = React.useState("");

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("aw-source-preferences");
            if (!raw) return;

            const parsed = JSON.parse(raw) as {
                bucketMode?: BucketMode;
                manualBucketId?: string | null;
                watcherFilters?: Partial<Record<WatcherCategory, boolean>>;
            };

            if (
                parsed.bucketMode === "auto" ||
                parsed.bucketMode === "default" ||
                parsed.bucketMode === "manual"
            ) {
                setBucketMode(parsed.bucketMode);
            }

            if (parsed.watcherFilters) {
                setWatcherFilters((prev) => ({
                    ...prev,
                    ...parsed.watcherFilters,
                }));
            }
            if (typeof parsed.manualBucketId === "string") {
                setManualBucketId(parsed.manualBucketId);
            }
        } catch {
            // Ignore malformed local preference payloads.
        }
    }, []);

    React.useEffect(() => {
        localStorage.setItem(
            "aw-source-preferences",
            JSON.stringify({ bucketMode, manualBucketId, watcherFilters }),
        );
    }, [bucketMode, manualBucketId, watcherFilters]);

    const toggleFeed = React.useCallback(() => {
        const p = feedPanelRef.current;
        if (!p) return;
        if (p.isCollapsed()) p.expand();
        else p.collapse();
    }, [feedPanelRef]);

    const toggleWatcherFilter = React.useCallback((id: WatcherCategory) => {
        setWatcherFilters((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    return (
        <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-screen w-full"
            defaultLayout={{ main: 100, feed: 0 }}
        >
            <ResizablePanel id="main" minSize="40%" className="min-w-0">
                <div className="min-h-screen w-full bg-zinc-50 px-6 py-12 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
                    <main className="mx-auto w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                                    ActivityWork Plugin
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                                    Turn ActivityWatch events into actionable
                                    work logs
                                </h1>
                                <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                    This MVP landing page verifies real data
                                    flow from ActivityWatch. It auto-fetches
                                    preview data and streams updates to the
                                    browser console so you can validate tracking
                                    behavior while switching windows.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={toggleFeed}
                                className={triggerClass}
                            >
                                {feedOpen ? "Hide Live Feed" : "Open Live Feed"}
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
                            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                                <p className="font-medium">Live Polling</p>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    Refreshes preview data every 5 seconds.
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                                <p className="font-medium">
                                    Console Visibility
                                </p>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    Logs each newly detected event timestamp.
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                                <p className="font-medium">Watcher Discovery</p>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    Shows available ActivityWatch buckets.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <a
                                className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                href="/api/aw/preview"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open Raw API Response
                            </a>
                        </div>

                        <div className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold">
                                Plugin Settings
                            </h2>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                Source selection preferences for bucket strategy
                                and watcher categories.
                            </p>

                            <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                    Preferred Bucket
                                </p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    {(
                                        [
                                            ["auto", "Auto"],
                                            ["default", "Default"],
                                            ["manual", "Manual"],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <label
                                            key={value}
                                            className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
                                        >
                                            <input
                                                type="radio"
                                                name="bucket-mode"
                                                value={value}
                                                checked={bucketMode === value}
                                                onChange={() =>
                                                    setBucketMode(value)
                                                }
                                                className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {bucketMode === "manual" ? (
                                    <div className="mt-3">
                                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Manual bucket id
                                        </label>
                                        <input
                                            type="text"
                                            value={manualBucketId}
                                            onChange={(event) =>
                                                setManualBucketId(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="aw-watcher-window_..."
                                            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-500"
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                    Watcher Categories
                                </p>
                                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                    Include or exclude ActivityWatch categories
                                    from the bridge.
                                </p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {watcherCategories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex cursor-pointer items-start gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    watcherFilters[category.id]
                                                }
                                                onChange={() =>
                                                    toggleWatcherFilter(
                                                        category.id,
                                                    )
                                                }
                                                className="mt-0.5 h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
                                            />
                                            <span>
                                                <span className="block font-medium">
                                                    {category.label}
                                                </span>
                                                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    {category.description}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
                id="feed"
                panelRef={feedPanelRef}
                collapsible
                collapsedSize="0%"
                minSize="18%"
                maxSize="42%"
                defaultSize="30%"
                className="h-full min-h-0 min-w-[280px] border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                style={{ overflow: "hidden" }}
                onResize={(size) => {
                    setFeedOpen(size.asPercentage > 0.5);
                }}
            >
                <div className="flex h-full min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                        <div className="">
                            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                ActivityWatch
                            </p>
                            <h2 className="text-sm font-semibold">Live Feed</h2>
                        </div>
                        <button
                            type="button"
                            onClick={toggleFeed}
                            className={`${triggerClass} px-2 py-1 text-xs`}
                        >
                            Close
                        </button>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
                        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                            <PreviewConsole />
                        </div>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
