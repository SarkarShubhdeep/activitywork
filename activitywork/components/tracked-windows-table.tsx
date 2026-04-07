"use client";

import * as React from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export type TrackedWindowRow = {
    /** Stable key for React (typically derived from app name). */
    rowKey: string;
    /** Display index in the # column. */
    index: number;
    appName: string;
    lastTitle: string;
    ignored: boolean;
};

export type TrackedWindowsTableProps = {
    rows: TrackedWindowRow[];
    onSetIgnored?: (appName: string, ignored: boolean) => void | Promise<void>;
    busyAppName?: string | null;
};

const TABLE_COLGROUP = (
    <colgroup>
        <col className="w-18" />
        <col />
        <col className="min-w-0 w-[40%]" />
        <col className="w-14" />
    </colgroup>
);

function openContextMenuFromClick(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
        new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: Math.min(r.right - 8, window.innerWidth - 4),
            clientY: r.top + r.height / 2,
            view: window,
            button: 2,
        }),
    );
}

/**
 * Split header/body tables with synced horizontal scroll so `position: sticky` works
 * with the shell’s vertical scroll (sticky must not sit inside the overflow-x scroller).
 */
export function TrackedWindowsTable({
    rows,
    onSetIgnored,
    busyAppName,
}: TrackedWindowsTableProps) {
    const headScrollRef = React.useRef<HTMLDivElement>(null);
    const bodyScrollRef = React.useRef<HTMLDivElement>(null);
    const syncingScroll = React.useRef(false);

    const syncHorizontalScroll = React.useCallback(
        (source: "head" | "body", scrollLeft: number) => {
            if (syncingScroll.current) return;
            const headEl = headScrollRef.current;
            const bodyEl = bodyScrollRef.current;
            const target = source === "head" ? bodyEl : headEl;
            if (!target || target.scrollLeft === scrollLeft) return;
            syncingScroll.current = true;
            target.scrollLeft = scrollLeft;
            queueMicrotask(() => {
                syncingScroll.current = false;
            });
        },
        [],
    );

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
            <div className="sticky top-0 z-20 shrink-0 rounded-t-lg border border-b-0 border-border bg-background">
                <div
                    ref={headScrollRef}
                    className="overflow-x-auto"
                    onScroll={(e) =>
                        syncHorizontalScroll("head", e.currentTarget.scrollLeft)
                    }
                >
                    <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                        {TABLE_COLGROUP}
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium text-muted-foreground"
                                >
                                    #
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium text-muted-foreground"
                                >
                                    Application
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-medium text-muted-foreground"
                                >
                                    Last seen title
                                </th>
                                <th
                                    scope="col"
                                    className="w-14 px-2 py-3 text-right font-medium text-muted-foreground"
                                >
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
            <ScrollArea className="min-h-0 flex-1 rounded-b-lg border border-t-0 border-border">
                <div
                    ref={bodyScrollRef}
                    className="overflow-x-auto"
                    onScroll={(e) =>
                        syncHorizontalScroll("body", e.currentTarget.scrollLeft)
                    }
                >
                    <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                        {TABLE_COLGROUP}
                        <tbody className="divide-y divide-border">
                            {rows.map((row) => (
                                <tr
                                    key={row.rowKey}
                                    className={
                                        row.ignored
                                            ? "bg-muted/30 hover:bg-muted/40"
                                            : "bg-background hover:bg-muted/20"
                                    }
                                >
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {row.index}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        <span className="inline-flex items-center gap-2">
                                            {row.ignored ? (
                                                <X
                                                    className="size-4 shrink-0 text-muted-foreground"
                                                    aria-hidden
                                                />
                                            ) : null}
                                            <span
                                                className={
                                                    row.ignored
                                                        ? "text-muted-foreground line-through decoration-muted-foreground/60"
                                                        : undefined
                                                }
                                            >
                                                {row.appName}
                                            </span>
                                            {row.ignored ? (
                                                <span className="sr-only">
                                                    Ignored
                                                </span>
                                            ) : null}
                                        </span>
                                    </td>
                                    <td className="truncate px-4 py-3 text-muted-foreground">
                                        {row.lastTitle}
                                    </td>
                                    <td className="px-2 py-1">
                                        <ContextMenu>
                                            <ContextMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={
                                                        busyAppName ===
                                                            row.appName ||
                                                        !onSetIgnored
                                                    }
                                                    className="text-muted-foreground hover:text-foreground"
                                                    aria-label={`More actions for ${row.appName}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        openContextMenuFromClick(
                                                            e.currentTarget,
                                                        );
                                                    }}
                                                >
                                                    <span
                                                        className="text-base leading-none font-medium tracking-widest"
                                                        aria-hidden
                                                    >
                                                        •••
                                                    </span>
                                                </Button>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="min-w-44">
                                                <ContextMenuItem
                                                    disabled={
                                                        row.ignored ||
                                                        busyAppName ===
                                                            row.appName
                                                    }
                                                    onSelect={() => {
                                                        void onSetIgnored?.(
                                                            row.appName,
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    Ignore app
                                                </ContextMenuItem>
                                                <ContextMenuItem
                                                    disabled={
                                                        !row.ignored ||
                                                        busyAppName ===
                                                            row.appName
                                                    }
                                                    onSelect={() => {
                                                        void onSetIgnored?.(
                                                            row.appName,
                                                            false,
                                                        );
                                                    }}
                                                >
                                                    Unignore app
                                                </ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ScrollArea>
        </div>
    );
}
