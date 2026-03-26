"use client";

import { useEffect, useState } from "react";

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

export function PreviewConsole() {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <p className="mt-6 text-sm text-red-600 dark:text-red-400">
        {`Preview failed: ${error}`}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Loading preview...
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
      <p>{`bucketId: ${data.bucketId ?? "n/a"}`}</p>
      <p>{`eventCount: ${data.eventCount ?? 0}`}</p>
      <p>{`latestEventAt: ${data.latestEventAt ?? "n/a"}`}</p>
      <p>{`watchers available: ${data.bucketCount ?? 0}`}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Polling every 5 seconds. Check browser console for live JSON updates.
      </p>
    </div>
  );
}
