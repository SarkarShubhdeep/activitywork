"use client";

import { ArrowUpRight, Box, Eye, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function AboutPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Turn ActivityWatch events into actionable work logs
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    This MVP landing page verifies real data flow from
                    ActivityWatch. It auto-fetches preview data and streams
                    updates to the browser console so you can validate tracking
                    behavior while switching windows.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <Card size="sm" className="py-3">
                    <CardHeader className="px-3 pb-1">
                        <div className="flex items-center gap-2">
                            <Radar className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm">
                                Live polling
                            </CardTitle>
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
                <Button
                    variant="default"
                    asChild
                    className="gap-2 rounded-full px-4 h-12"
                    size="lg"
                >
                    <a href="/api/aw/preview" target="_blank" rel="noreferrer">
                        Open raw API response
                        <ArrowUpRight className="size-4" />
                    </a>
                </Button>
            </div>
        </div>
    );
}
