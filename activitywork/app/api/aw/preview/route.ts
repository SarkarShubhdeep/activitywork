import { NextResponse } from "next/server";

import {
  fetchBucketEvents,
  fetchBuckets,
  selectPreferredBucketId,
} from "@/lib/activitywatch-client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bucketIdFromQuery = url.searchParams.get("bucketId");
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;

    const buckets = await fetchBuckets();
    const bucketId = bucketIdFromQuery ?? selectPreferredBucketId(buckets);

    if (!bucketId) {
      return NextResponse.json(
        { ok: false, error: "No ActivityWatch buckets found." },
        { status: 404 }
      );
    }

    const events = await fetchBucketEvents(
      bucketId,
      Number.isFinite(limit) && limit > 0 ? limit : 50
    );

    return NextResponse.json({
      ok: true,
      bucketId,
      bucketCount: buckets.length,
      buckets,
      eventCount: events.length,
      latestEventAt: events[0]?.timestamp ?? null,
      sample: events.slice(0, 10),
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
