/**
 * Builds the same query string as PreviewConsole uses for `/api/aw/preview`,
 * so tracked apps use identical bucket / watcher selection from local preferences.
 */
export function buildAwPreviewQueryString(options?: { eventLimit?: number }) {
    if (typeof window === "undefined") {
        return "";
    }

    const eventLimit = options?.eventLimit ?? 400;

    try {
        const raw = localStorage.getItem("aw-source-preferences");
        const parsed = raw
            ? (JSON.parse(raw) as {
                  bucketMode?: string;
                  manualBucketId?: string | null;
                  watcherFilters?: Record<string, boolean>;
              })
            : null;

        const bucketMode = parsed?.bucketMode;
        const manualBucketId = parsed?.manualBucketId;
        const watcherFilters = parsed?.watcherFilters ?? {};

        const params = new URLSearchParams();

        if (bucketMode === "manual" && typeof manualBucketId === "string") {
            const id = manualBucketId.trim();
            if (id.length > 0) {
                params.set("bucketId", id);
            }
        }

        if (bucketMode === "auto") {
            const enabledWatchers = Object.entries(watcherFilters)
                .filter(([, enabled]) => enabled)
                .map(([w]) => w);
            if (enabledWatchers.length > 0) {
                params.set("watcherCategories", enabledWatchers.join(","));
            }
        }

        params.set("limit", String(eventLimit));
        return params.toString();
    } catch {
        return new URLSearchParams({ limit: String(eventLimit) }).toString();
    }
}
