import { NextResponse } from "next/server";

import {
  fetchBucketEvents,
  fetchBuckets,
  selectPreferredBucketId,
} from "@/lib/activitywatch-client";

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
    const bucketIdFromQuery = url.searchParams.get("bucketId");
    const bucketIdsFromQuery = url.searchParams.get("bucketIds");
    const watcherCategoriesFromQuery = url.searchParams.get("watcherCategories");
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;

    const buckets = await fetchBuckets();
    const requestedBucketIds = bucketIdsFromQuery
      ? bucketIdsFromQuery
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : [];
    const requestedWatcherCategories = watcherCategoriesFromQuery
      ? watcherCategoriesFromQuery
          .split(",")
          .map((id) => id.trim().toLowerCase())
          .filter((id): id is WatcherCategory =>
            ["window", "web", "vscode", "afk"].includes(id)
          )
      : [];

    const bucketIdsToRead = new Set<string>();
    if (bucketIdFromQuery) {
      bucketIdsToRead.add(bucketIdFromQuery);
    } else if (requestedBucketIds.length > 0) {
      for (const id of requestedBucketIds) {
        bucketIdsToRead.add(id);
      }
    } else if (requestedWatcherCategories.length > 0) {
      for (const category of requestedWatcherCategories) {
        const match = buckets.find((bucket) =>
          bucket.id.toLowerCase().includes(`aw-watcher-${category}`)
        );
        if (match) {
          bucketIdsToRead.add(match.id);
        }
      }
    } else {
      const selectedBucketId = selectPreferredBucketId(buckets);
      if (selectedBucketId) {
        bucketIdsToRead.add(selectedBucketId);
      }
    }

    if (bucketIdsToRead.size === 0) {
      return NextResponse.json(
        { ok: false, error: "No ActivityWatch buckets found." },
        { status: 404 }
      );
    }

    const bucketIds = Array.from(bucketIdsToRead);
    const eventsByBucket = await Promise.all(
      bucketIds.map(async (bucketId) => ({
        bucketId,
        events: await fetchBucketEvents(bucketId, safeLimit),
      }))
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
