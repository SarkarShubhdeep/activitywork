import { NextResponse } from "next/server";

import { selectBucketIdsFromPreviewUrl } from "@/lib/aw-preview-bucket-query";
import { fetchBuckets, fetchEventsForBuckets } from "@/lib/activitywatch-client";

export const runtime = "nodejs";

type WatcherCategory = "window" | "web" | "vscode" | "afk";

function watcherFromBucketId(bucketId: string): WatcherCategory | "unknown" {
  const lowerId = bucketId.toLowerCase();
  if (lowerId.includes("aw-watcher-window")) return "window";
  if (lowerId.includes("aw-watcher-web")) return "web";
  if (lowerId.includes("aw-watcher-vscode")) return "vscode";
  if (lowerId.includes("aw-watcher-afk")) return "afk";
  return "unknown";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;

    const buckets = await fetchBuckets();
    const bucketIds = selectBucketIdsFromPreviewUrl(url, buckets);

    if (bucketIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No ActivityWatch buckets found." },
        { status: 404 }
      );
    }
    const eventsByBucket = await fetchEventsForBuckets(
      bucketIds,
      safeLimit
    );
    const mergedEvents = eventsByBucket
      .flatMap(({ bucketId, events }) =>
        events.map((event) => ({
          ...event,
          bucketId,
          watcher: watcherFromBucketId(bucketId),
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
      );

    return NextResponse.json({
      ok: true,
      bucketId: bucketIds.join(","),
      bucketCount: buckets.length,
      buckets,
      eventCount: mergedEvents.length,
      latestEventAt: mergedEvents[0]?.timestamp ?? null,
      sample: mergedEvents.slice(0, 10),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { ok: false, error: message },
      {
        status: 500,
      }
    );
  }
}
