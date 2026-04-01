"use client";

import * as React from "react";
import { usePanelRef } from "react-resizable-panels";

import { PreviewConsole } from "./preview-console";
import {
    DashboardPage,
    type BucketMode,
    type WatcherCategory,
} from "./pages/dashboard-page";
import { TrackedWindowsPlaceholder } from "./pages/tracked-windows-placeholder";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

type AppPageId = "dashboard" | "tracked-windows";

const triggerClass =
    "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

const navItems: Array<{ id: AppPageId; label: string }> = [
    { id: "dashboard", label: "Home" },
    { id: "tracked-windows", label: "Tracked windows" },
];

export function HomeShell() {
    const feedPanelRef = usePanelRef();
    const [feedOpen, setFeedOpen] = React.useState(false);
    const [activePage, setActivePage] = React.useState<AppPageId>("dashboard");
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
                    <main className="mx-auto flex w-full max-w-5xl flex-col rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                        <nav
                            className="mb-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800"
                            aria-label="App sections"
                        >
                            {navItems.map((item) => {
                                const isActive = activePage === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActivePage(item.id)}
                                        className={
                                            isActive
                                                ? "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                                                : "rounded-md border border-transparent px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                                        }
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="min-w-0 flex-1">
                            {activePage === "dashboard" ? (
                                <DashboardPage
                                    feedOpen={feedOpen}
                                    onToggleFeed={toggleFeed}
                                    bucketMode={bucketMode}
                                    setBucketMode={setBucketMode}
                                    manualBucketId={manualBucketId}
                                    setManualBucketId={setManualBucketId}
                                    watcherFilters={watcherFilters}
                                    toggleWatcherFilter={toggleWatcherFilter}
                                />
                            ) : (
                                <TrackedWindowsPlaceholder />
                            )}
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
