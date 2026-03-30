"use client";

import { useEffect, useRef, useState } from "react";

type BucketInfo = {
  id: string;
  type?: string;
  client?: string;
  hostname?: string;
};

type PreviewResponse = {
  ok: boolean;
  bucketId?: string;
  bucketCount?: number;
  buckets?: BucketInfo[];
  eventCount?: number;
  latestEventAt?: string | null;
  sample?: unknown[];
  error?: string;
};

type ActivityEvent = {
  id?: number;
  timestamp?: string;
  duration?: number;
  data?: Record<string, unknown>;
};

type NormalizedFeedEvent = {
  id: string;
  title: string;
  durationSeconds: number;
  durationLabel: string;
  startedAt: string;
  startedAtMs: number;
  app: string;
  url: string | null;
  category: string;
};

function toDurationLabel(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

function toTimestampLabel(value: string | undefined) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeEvent(raw: ActivityEvent, index: number): NormalizedFeedEvent {
  const data = raw.data ?? {};
  const app =
    asString(data.app) ??
    asString(data["app_name"]) ??
    asString(data["browser"]) ??
    "unknown";
  const title =
    asString(data.title) ??
    asString(data["window_title"]) ??
    asString(data["tab_title"]) ??
    asString(data.url) ??
    app;
  const category =
    asString(data["$category"]) ??
    asString(data.category) ??
    asString(data["bucket"]) ??
    "activity";
  const url = asString(data.url) ?? asString(data["current_url"]);
  const durationSeconds =
    typeof raw.duration === "number" && Number.isFinite(raw.duration)
      ? raw.duration
      : 0;

  const startedAtMs = raw.timestamp ? new Date(raw.timestamp).getTime() : 0;

  return {
    id: String(raw.id ?? `${raw.timestamp ?? "event"}-${index}`),
    title,
    durationSeconds,
    durationLabel: toDurationLabel(durationSeconds),
    startedAt: toTimestampLabel(raw.timestamp),
    startedAtMs: Number.isFinite(startedAtMs) ? startedAtMs : 0,
    app,
    url,
    category,
  };
}

export function PreviewConsole() {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null
  );
  const knownEventIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    let lastSeenTimestamp: string | null = null;

    async function loadPreview() {
      try {
        const response = await fetch("/api/aw/preview");
        const json = (await response.json()) as PreviewResponse;

        if (!isMounted) {
          return;
        }

        if (json.latestEventAt && json.latestEventAt !== lastSeenTimestamp) {
          console.log("ActivityWatch live update:", json);
          lastSeenTimestamp = json.latestEventAt;
        }

        setData(json);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load preview";
        console.error("Failed to fetch ActivityWatch preview:", err);

        if (isMounted) {
          setError(message);
        }
      }
    }

    void loadPreview();
    const intervalId = setInterval(() => {
      void loadPreview();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const normalizedFeed = ((data?.sample ?? []) as ActivityEvent[])
    .map(normalizeEvent)
    .sort((a, b) => b.startedAtMs - a.startedAtMs);

  useEffect(() => {
    if (normalizedFeed.length === 0) return;

    const currentIds = normalizedFeed.map((event) => event.id);
    const knownIds = knownEventIdsRef.current;
    const justArrived = currentIds.filter((id) => !knownIds.has(id));

    if (knownIds.size === 0) {
      knownEventIdsRef.current = new Set(currentIds);
      return;
    }

    if (justArrived.length > 0) {
      // Feed is already newest-first, so first match is the newest incoming event.
      const newestIncomingId = normalizedFeed.find((event) =>
        justArrived.includes(event.id)
      )?.id;

      if (newestIncomingId) {
        setHighlightedEventId(newestIncomingId);
      }

      const timeoutId = setTimeout(() => {
        setHighlightedEventId((current) =>
          current === newestIncomingId ? null : current
        );
      }, 500);

      knownEventIdsRef.current = new Set(currentIds);
      return () => clearTimeout(timeoutId);
    }

    knownEventIdsRef.current = new Set(currentIds);
  }, [normalizedFeed]);

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {`Preview failed: ${error}`}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading preview...</p>
    );
  }

  return (
    <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
      <p>{`bucketId: ${data.bucketId ?? "n/a"}`}</p>
      <p>{`eventCount: ${data.eventCount ?? 0}`}</p>
      <p>{`latestEventAt: ${data.latestEventAt ?? "n/a"}`}</p>
      <p>{`watchers available: ${data.bucketCount ?? 0}`}</p>
      <p>{`feedEntries: ${normalizedFeed.length}`}</p>

      <div className="space-y-2 pt-1">
        {normalizedFeed.length > 0 ? (
          normalizedFeed.map((event) => (
            <div
              key={event.id}
              className="relative"
            >
              {highlightedEventId === event.id ? (
                <span
                  className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500"
                  aria-label="New event"
                  title="New event"
                />
              ) : null}
              <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-100 p-3 text-xs leading-5 dark:border-zinc-800 dark:bg-zinc-900">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No events in preview sample yet.
          </p>
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Polling every 5 seconds. Browser console still logs raw live updates.
      </p>
    </div>
  );
}
