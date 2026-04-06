export type ActivityWatchBucket = {
  id: string;
  type?: string;
  client?: string;
  hostname?: string;
};

export type ActivityWatchEvent = {
  id?: number;
  timestamp: string;
  duration: number;
  data: Record<string, unknown>;
};

const DEFAULT_ACTIVITYWATCH_BASE_URL = "http://localhost:5600/api/0";

/** Default ceiling for how long we wait on ActivityWatch before failing the request. */
export const DEFAULT_ACTIVITYWATCH_FETCH_TIMEOUT_MS = 12_000;

/** Max parallel bucket event fetches to limit load on ActivityWatch and memory spikes. */
export const DEFAULT_ACTIVITYWATCH_BUCKET_CONCURRENCY = 2;

export type ActivityWatchFetchOptions = {
  signal?: AbortSignal;
  /** Total timeout for this HTTP request (uses AbortSignal.timeout). */
  timeoutMs?: number;
};

function getBaseUrl() {
  const baseUrl =
    process.env.ACTIVITYWATCH_BASE_URL ?? DEFAULT_ACTIVITYWATCH_BASE_URL;
  return baseUrl.replace(/\/$/, "");
}

function requestSignal(
  options?: ActivityWatchFetchOptions,
): AbortSignal | undefined {
  const timeoutMs =
    options?.timeoutMs ?? DEFAULT_ACTIVITYWATCH_FETCH_TIMEOUT_MS;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!options?.signal) {
    return timeoutSignal;
  }
  return AbortSignal.any([options.signal, timeoutSignal]);
}

/**
 * Runs async work on `items` with at most `concurrency` in flight (stable order).
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }
  const results = new Array<R>(items.length);
  const limit = Math.max(1, concurrency);
  let next = 0;

  async function worker() {
    while (true) {
      const i = next;
      next += 1;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function fetchBuckets(options?: ActivityWatchFetchOptions) {
  const response = await fetch(`${getBaseUrl()}/buckets`, {
    cache: "no-store",
    signal: requestSignal(options),
  });

  if (!response.ok) {
    throw new Error(`ActivityWatch buckets request failed (${response.status})`);
  }

  const buckets = (await response.json()) as Record<string, ActivityWatchBucket>;

  return Object.entries(buckets).map(([id, bucket]) => ({
    id,
    type: bucket.type,
    client: bucket.client,
    hostname: bucket.hostname,
  }));
}

export async function fetchBucketEvents(
  bucketId: string,
  limit = 50,
  options?: ActivityWatchFetchOptions,
) {
  const end = new Date();
  const start = new Date(end.getTime() - 1000 * 60 * 10);

  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    limit: String(limit),
  });

  const response = await fetch(
    `${getBaseUrl()}/buckets/${encodeURIComponent(bucketId)}/events?${params.toString()}`,
    { cache: "no-store", signal: requestSignal(options) },
  );

  if (!response.ok) {
    throw new Error(
      `ActivityWatch events request failed (${response.status}) for ${bucketId}`
    );
  }

  return (await response.json()) as ActivityWatchEvent[];
}

export type FetchEventsForBucketsOptions = ActivityWatchFetchOptions & {
  concurrency?: number;
};

/**
 * Fetches recent events for each bucket ID with bounded parallelism.
 */
export async function fetchEventsForBuckets(
  bucketIds: string[],
  limit: number,
  options?: FetchEventsForBucketsOptions,
) {
  const concurrency =
    options?.concurrency ?? DEFAULT_ACTIVITYWATCH_BUCKET_CONCURRENCY;
  return mapWithConcurrency(bucketIds, concurrency, async (bucketId) => ({
    bucketId,
    events: await fetchBucketEvents(bucketId, limit, options),
  }));
}

export function selectPreferredBucketId(buckets: ActivityWatchBucket[]) {
  if (buckets.length === 0) {
    return null;
  }

  const preferredMatchers = [
    "aw-watcher-window",
    "aw-watcher-web",
    "aw-watcher-vscode",
    "aw-watcher-afk",
  ];

  const lowerIds = buckets.map((bucket) => ({
    originalId: bucket.id,
    lowerId: bucket.id.toLowerCase(),
  }));

  for (const matcher of preferredMatchers) {
    const match = lowerIds.find((bucket) => bucket.lowerId.includes(matcher));
    if (match) {
      return match.originalId;
    }
  }

  return buckets[0]?.id ?? null;
}
