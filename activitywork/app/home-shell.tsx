"use client";

import { PreviewConsole } from "./preview-console";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export function HomeShell() {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="min-h-screen w-full bg-zinc-50 px-6 py-12 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
                <main className="mx-auto w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                                ActivityWork Plugin
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                                Turn ActivityWatch events into actionable work
                                logs
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                This MVP landing page verifies real data flow
                                from ActivityWatch. It auto-fetches preview data
                                and streams updates to the browser console so
                                you can validate tracking behavior while
                                switching windows.
                            </p>
                        </div>
                        <SidebarTrigger>Open Live Feed</SidebarTrigger>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                            <p className="font-medium">Live Polling</p>
                            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                Refreshes preview data every 5 seconds.
                            </p>
                        </div>
                        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                            <p className="font-medium">Console Visibility</p>
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
                </main>
            </div>

            <Sidebar side="right">
                <SidebarHeader>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            ActivityWatch
                        </p>
                        <h2 className="text-sm font-semibold">Live Feed</h2>
                    </div>
                    <SidebarTrigger className="px-2 py-1 text-xs">
                        Close
                    </SidebarTrigger>
                </SidebarHeader>
                <SidebarContent>
                    <PreviewConsole />
                    <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                        This panel refreshes automatically every 5 seconds.
                    </p>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}
