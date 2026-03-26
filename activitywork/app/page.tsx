import { PreviewConsole } from "./preview-console";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          ActivityWork Plugin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Turn ActivityWatch events into actionable work logs
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          This MVP landing page verifies real data flow from ActivityWatch. It
          auto-fetches preview data and streams updates to the browser console
          so you can validate tracking behavior while switching windows.
        </p>

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

        <PreviewConsole />
      </main>
    </div>
  );
}
