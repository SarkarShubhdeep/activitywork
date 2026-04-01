"use client";

import {
    Box,
    ExternalLink,
    Eye,
    PanelRightClose,
    PanelRightOpen,
    Radar,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type BucketMode = "auto" | "default" | "manual";
export type WatcherCategory = "window" | "web" | "vscode" | "afk";

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

export type DashboardPageProps = {
    feedOpen: boolean;
    onToggleFeed: () => void;
    bucketMode: BucketMode;
    setBucketMode: (mode: BucketMode) => void;
    manualBucketId: string;
    setManualBucketId: (id: string) => void;
    watcherFilters: Record<WatcherCategory, boolean>;
    toggleWatcherFilter: (id: WatcherCategory) => void;
};

const bucketModes: Array<{ value: BucketMode; label: string }> = [
    { value: "auto", label: "Auto" },
    { value: "default", label: "Default" },
    { value: "manual", label: "Manual" },
];

export function DashboardPage({
    feedOpen,
    onToggleFeed,
    bucketMode,
    setBucketMode,
    manualBucketId,
    setManualBucketId,
    watcherFilters,
    toggleWatcherFilter,
}: DashboardPageProps) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                            ActivityWork
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            Plugin
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Turn ActivityWatch events into actionable work logs
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        This MVP landing page verifies real data flow from
                        ActivityWatch. It auto-fetches preview data and streams
                        updates to the browser console so you can validate
                        tracking behavior while switching windows.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onToggleFeed}
                    className="shrink-0 gap-2 self-start sm:self-auto"
                >
                    {feedOpen ? (
                        <>
                            Hide live feed
                            <PanelRightClose className="size-4" />
                        </>
                    ) : (
                        <>
                            Open live feed
                            <PanelRightOpen className="size-4" />
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <Card size="sm" className="py-3">
                    <CardHeader className="px-3 pb-1">
                        <div className="flex items-center gap-2">
                            <Radar className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm">Live polling</CardTitle>
                        </div>
                        <CardDescription>
                            Refreshes preview data every 5 seconds.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card size="sm" className="py-3">
                    <CardHeader className="px-3 pb-1">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm">
                                Console visibility
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Logs each newly detected event timestamp.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card size="sm" className="py-3">
                    <CardHeader className="px-3 pb-1">
                        <div className="flex items-center gap-2">
                            <Box className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm">
                                Watcher discovery
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Shows available ActivityWatch buckets.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div>
                <Button variant="default" asChild className="gap-2">
                    <a
                        href="/api/aw/preview"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open raw API response
                        <ExternalLink className="size-4" />
                    </a>
                </Button>
            </div>

            <Card>
                <CardHeader className="border-b border-border pb-4">
                    <CardTitle>Plugin settings</CardTitle>
                    <CardDescription>
                        Source selection preferences for bucket strategy and
                        watcher categories.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Preferred bucket
                        </Label>
                        <RadioGroup
                            value={bucketMode}
                            onValueChange={(v) =>
                                setBucketMode(v as BucketMode)
                            }
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            {bucketModes.map(({ value, label }) => (
                                <div
                                    key={value}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                                >
                                    <RadioGroupItem
                                        value={value}
                                        id={`bucket-${value}`}
                                    />
                                    <Label
                                        htmlFor={`bucket-${value}`}
                                        className="cursor-pointer font-normal"
                                    >
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {bucketMode === "manual" ? (
                            <div className="space-y-2 pt-1">
                                <Label
                                    htmlFor="manual-bucket-id"
                                    className="text-xs text-muted-foreground"
                                >
                                    Manual bucket id
                                </Label>
                                <Input
                                    id="manual-bucket-id"
                                    type="text"
                                    value={manualBucketId}
                                    onChange={(event) =>
                                        setManualBucketId(event.target.value)
                                    }
                                    placeholder="aw-watcher-window_..."
                                    autoComplete="off"
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Watcher categories
                            </Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Include or exclude ActivityWatch categories from
                                the bridge.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {watcherCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3"
                                >
                                    <Checkbox
                                        id={`watcher-${category.id}`}
                                        checked={watcherFilters[category.id]}
                                        onCheckedChange={(checked) => {
                                            if (checked === "indeterminate")
                                                return;
                                            if (
                                                checked !==
                                                watcherFilters[category.id]
                                            ) {
                                                toggleWatcherFilter(
                                                    category.id,
                                                );
                                            }
                                        }}
                                        className="mt-0.5"
                                    />
                                    <div className="grid min-w-0 gap-0.5 leading-none">
                                        <Label
                                            htmlFor={`watcher-${category.id}`}
                                            className="cursor-pointer font-medium"
                                        >
                                            {category.label}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {category.description}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
