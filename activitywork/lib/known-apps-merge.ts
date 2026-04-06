import type { AggregatedTrackedApp } from "@/lib/aw-tracked-apps";
import type { MergeKnownAppsResult } from "@/lib/catalog-app-name";
import { mergeKnownAppsIntoCatalog } from "@/lib/catalog-sqlite";

export {
    KNOWN_APP_NAME_MAX_LEN,
    KNOWN_APP_TITLE_MAX_LEN,
    KNOWN_APP_UPSERT_CHUNK,
    type MergeKnownAppsResult,
    normalizeAppNameForStorage,
} from "@/lib/catalog-app-name";

/**
 * Persists aggregated ActivityWatch apps (SQLite; tables ensured at runtime).
 */
export async function mergeKnownAppsFromAggregated(
    apps: AggregatedTrackedApp[],
): Promise<MergeKnownAppsResult> {
    return Promise.resolve(mergeKnownAppsIntoCatalog(apps));
}
