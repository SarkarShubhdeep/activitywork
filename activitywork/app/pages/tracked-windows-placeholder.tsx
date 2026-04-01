"use client";

import { AppWindow } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function TrackedWindowsPlaceholder() {
    return (
        <Card className="border-dashed">
            <CardHeader className="items-center pb-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <AppWindow
                        className="size-6 text-muted-foreground"
                        aria-hidden
                    />
                </div>
                <CardTitle className="text-base">Tracked windows</CardTitle>
                <CardDescription className="max-w-sm text-pretty">
                    Placeholder screen. The list of tracked app and window names
                    will appear here in a later change.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[28vh] items-center justify-center pb-8" />
        </Card>
    );
}
