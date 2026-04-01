"use client";

export function TrackedWindowsPlaceholder() {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-600 dark:bg-zinc-900/30">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Tracked windows
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Placeholder screen. The list of tracked app and window names
                will appear here in a later change.
            </p>
        </div>
    );
}
