/** Case-sensitive trimmed name as stored; ActivityWatch app names are compared as-is after trim. */
export const KNOWN_APP_NAME_MAX_LEN = 256;
export const KNOWN_APP_TITLE_MAX_LEN = 500;
export const KNOWN_APP_UPSERT_CHUNK = 50;

export type MergeKnownAppsResult = {
    inserted: number;
    updated: number;
    skippedInvalid: number;
};

/**
 * Returns normalized app name for DB storage, or null if invalid.
 */
export function normalizeAppNameForStorage(raw: string): string | null {
    const name = raw.trim();
    if (name.length === 0) return null;
    if (name.length > KNOWN_APP_NAME_MAX_LEN) return null;
    return name;
}
