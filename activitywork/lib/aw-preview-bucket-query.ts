import type { ActivityWatchBucket } from "@/lib/activitywatch-client";
import { selectPreferredBucketId } from "@/lib/activitywatch-client";

type WatcherCategory = "window" | "web" | "vscode" | "afk";

/**
 * Same bucket selection as GET /api/aw/preview so the tracked-apps list matches the live feed.
 */
export function selectBucketIdsFromPreviewUrl(
    url: URL,
    buckets: ActivityWatchBucket[],
): string[] {
    const bucketIdFromQuery = url.searchParams.get("bucketId");
    const bucketIdsFromQuery = url.searchParams.get("bucketIds");
    const watcherCategoriesFromQuery = url.searchParams.get("watcherCategories");

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
                  ["window", "web", "vscode", "afk"].includes(id),
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
                bucket.id.toLowerCase().includes(`aw-watcher-${category}`),
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

    return Array.from(bucketIdsToRead);
}
