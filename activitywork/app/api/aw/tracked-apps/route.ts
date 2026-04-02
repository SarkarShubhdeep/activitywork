import { NextResponse } from "next/server";

import { selectBucketIdsFromPreviewUrl } from "@/lib/aw-preview-bucket-query";
import { aggregateUniqueAppsFromEvents } from "@/lib/aw-tracked-apps";
import {
    fetchBucketEvents,
    fetchBuckets,
} from "@/lib/activitywatch-client";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? Number(limitParam) : 400;
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 2000) : 400;

        const buckets = await fetchBuckets();
        const bucketIds = selectBucketIdsFromPreviewUrl(url, buckets);

        if (bucketIds.length === 0) {
            return NextResponse.json(
                { ok: false, error: "No ActivityWatch buckets found." },
                { status: 404 },
            );
        }

        const eventsByBucket = await Promise.all(
            bucketIds.map(async (bucketId) => ({
                bucketId,
                events: await fetchBucketEvents(bucketId, safeLimit),
            })),
        );

        const merged = eventsByBucket.flatMap(({ events }) => events);
        const apps = aggregateUniqueAppsFromEvents(merged);

        return NextResponse.json({
            ok: true,
            bucketId: bucketIds.join(","),
            bucketCount: buckets.length,
            apps,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown server error";

        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}
