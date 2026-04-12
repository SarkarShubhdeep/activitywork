"use client";

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

export type PluginSettingsPageProps = {
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

export function PluginSettingsPage({
    bucketMode,
    setBucketMode,
    manualBucketId,
    setManualBucketId,
    watcherFilters,
    toggleWatcherFilter,
}: PluginSettingsPageProps) {
    return (
        <Card>
            <CardHeader className="border-b border-border pb-4">
                <CardTitle>Plugin settings</CardTitle>
                <CardDescription>
                    Source selection preferences for bucket strategy and watcher
                    categories.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Preferred bucket
                    </Label>
                    <RadioGroup
                        value={bucketMode}
                        onValueChange={(v) => setBucketMode(v as BucketMode)}
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
                            Include or exclude ActivityWatch categories from the
                            bridge.
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
                                            toggleWatcherFilter(category.id);
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
    );
}
