"use client";

import * as React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { usePanelRef } from "react-resizable-panels";

import { PreviewConsole } from "./preview-console";
import { AboutPage } from "./pages/home-page";
import {
    PluginSettingsPage,
    type BucketMode,
    type WatcherCategory,
} from "./pages/plugin-settings-page";
import { TrackedWindowsPlaceholder } from "./pages/tracked-windows-placeholder";
import {
    AppSidebar,
    getAppPageTitle,
    type AppPageId,
} from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export function HomeShell() {
    const feedPanelRef = usePanelRef();
    const [feedOpen, setFeedOpen] = React.useState(false);
    const [activePage, setActivePage] = React.useState<AppPageId>("home");
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
        <SidebarProvider defaultOpen>
            <AppSidebar activePage={activePage} onNavigate={setActivePage} />
            <SidebarInset className="relative flex h-svh min-h-0 w-full flex-col overflow-hidden p-0">
                <Button
                    variant="ghost"
                    onClick={toggleFeed}
                    title={feedOpen ? "Hide live feed" : "Open live feed"}
                    aria-label={feedOpen ? "Hide live feed" : "Open live feed"}
                    className="fixed top-2 right-2 z-50"
                >
                    {feedOpen ? (
                        <div className="flex flex-row items-center justify-center gap-2">
                            <span className="text-xs font-medium">
                                Close Live Feed
                            </span>
                            <PanelRightClose className="size-4" />
                        </div>
                    ) : (
                        <div className="flex flex-row items-center justify-center gap-2">
                            <span className="text-xs font-medium">
                                Open Live Feed
                            </span>
                            <PanelRightOpen className="size-4" />
                        </div>
                    )}
                </Button>
                <ResizablePanelGroup
                    orientation="horizontal"
                    className="min-h-0 w-full flex-1"
                    defaultLayout={{ main: 72, feed: 28 }}
                >
                    <ResizablePanel
                        id="main"
                        minSize="35%"
                        className="flex min-h-0 min-w-0 flex-col"
                    >
                        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
                            <SidebarTrigger />
                            <h1 className="min-w-0 truncate text-sm font-semibold text-foreground">
                                {getAppPageTitle(activePage)}
                            </h1>
                        </header>
                        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
                            <div className="mx-auto max-w-5xl sm:p-3">
                                <Card className="gap-0 py-0 shadow-none border-0 ring-0">
                                    <CardContent className="px-4 sm:px-8 sm:py-8">
                                        {activePage === "home" ? (
                                            <AboutPage />
                                        ) : null}
                                        {activePage === "tracked-windows" ? (
                                            <div className="flex h-[calc(100svh-9rem)] min-h-0 flex-col">
                                                <TrackedWindowsPlaceholder />
                                            </div>
                                        ) : null}
                                        {activePage === "plugin-settings" ? (
                                            <PluginSettingsPage
                                                bucketMode={bucketMode}
                                                setBucketMode={setBucketMode}
                                                manualBucketId={manualBucketId}
                                                setManualBucketId={
                                                    setManualBucketId
                                                }
                                                watcherFilters={watcherFilters}
                                                toggleWatcherFilter={
                                                    toggleWatcherFilter
                                                }
                                            />
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizablePanel
                        id="feed"
                        panelRef={feedPanelRef}
                        collapsible
                        collapsedSize="0%"
                        minSize="18%"
                        maxSize="42%"
                        defaultSize="28%"
                        className="flex min-h-0 min-w-[280px] flex-col border-l border-border bg-card"
                        style={{ overflow: "hidden" }}
                        onResize={(size) => {
                            setFeedOpen(size.asPercentage > 0.5);
                        }}
                    >
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                            <div className="shrink-0 border-b border-border h-12 p-4 flex items-center justify-start">
                                <h2 className="text-sm font-semibold">
                                    ActivityWatch{" "}
                                    <span className="ml-2 text-green-500">
                                        Tracking
                                    </span>
                                </h2>
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col p-4">
                                <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                                    <PreviewConsole />
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </SidebarInset>
        </SidebarProvider>
    );
}
