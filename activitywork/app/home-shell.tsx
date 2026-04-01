"use client";

import * as React from "react";
import { AppWindow, LayoutDashboard, PanelRightClose } from "lucide-react";
import { usePanelRef } from "react-resizable-panels";

import { PreviewConsole } from "./preview-console";
import {
    DashboardPage,
    type BucketMode,
    type WatcherCategory,
} from "./pages/dashboard-page";
import { TrackedWindowsPlaceholder } from "./pages/tracked-windows-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

type AppPageId = "dashboard" | "tracked-windows";

function parseAppPageId(value: string): AppPageId | null {
    if (value === "dashboard" || value === "tracked-windows") {
        return value;
    }
    return null;
}

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

    const onTabChange = React.useCallback((value: string) => {
        const next = parseAppPageId(value);
        if (next) setActivePage(next);
    }, []);

    return (
        <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-screen w-full"
            defaultLayout={{ main: 100, feed: 0 }}
        >
            <ResizablePanel id="main" minSize="40%" className="min-w-0">
                <div className="min-h-screen w-full bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
                    <Card className="mx-auto w-full max-w-5xl gap-0 border-0 py-0 shadow-none ring-1 ring-border">
                        <CardContent className="flex flex-col gap-0 px-4 pt-4 pb-6 sm:px-8 sm:pt-6 sm:pb-8">
                            <Tabs
                                value={activePage}
                                onValueChange={onTabChange}
                                className="w-full gap-0"
                            >
                                <nav
                                    className="flex flex-col gap-4"
                                    aria-label="App sections"
                                >
                                    <TabsList
                                        variant="line"
                                        className="h-auto w-full min-w-0 flex-wrap justify-start gap-1 bg-transparent p-0 sm:flex-nowrap"
                                    >
                                        <TabsTrigger
                                            value="dashboard"
                                            className="gap-1.5 px-3 py-2 data-[state=active]:after:opacity-100"
                                        >
                                            <LayoutDashboard
                                                className="size-4 shrink-0"
                                                aria-hidden
                                            />
                                            <span>Home</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="tracked-windows"
                                            className="gap-1.5 px-3 py-2 data-[state=active]:after:opacity-100"
                                        >
                                            <AppWindow
                                                className="size-4 shrink-0"
                                                aria-hidden
                                            />
                                            <span className="max-w-36 truncate sm:max-w-none">
                                                Tracked windows
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>
                                    <Separator className="bg-border" />
                                </nav>

                                <TabsContent
                                    value="dashboard"
                                    className="mt-6 min-w-0 flex-1 outline-none"
                                >
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
                                </TabsContent>
                                <TabsContent
                                    value="tracked-windows"
                                    className="mt-6 min-w-0 flex-1 outline-none"
                                >
                                    <TrackedWindowsPlaceholder />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
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
                className="h-full min-h-0 min-w-[280px] border-l border-border bg-card"
                style={{ overflow: "hidden" }}
                onResize={(size) => {
                    setFeedOpen(size.asPercentage > 0.5);
                }}
            >
                <div className="flex h-full min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
                        <div>
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                ActivityWatch
                            </p>
                            <h2 className="text-sm font-semibold">
                                Live Feed
                            </h2>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleFeed}
                            className="shrink-0 gap-1.5"
                        >
                            <PanelRightClose className="size-3.5" />
                            Close
                        </Button>
                    </div>
                    <Separator />
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
