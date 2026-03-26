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

function getBaseUrl() {
  const baseUrl =
    process.env.ACTIVITYWATCH_BASE_URL ?? DEFAULT_ACTIVITYWATCH_BASE_URL;
  return baseUrl.replace(/\/$/, "");
}

export async function fetchBuckets() {
  const response = await fetch(`${getBaseUrl()}/buckets`, {
    cache: "no-store",
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

export async function fetchBucketEvents(bucketId: string, limit = 50) {
  const end = new Date();
  const start = new Date(end.getTime() - 1000 * 60 * 10);

  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    limit: String(limit),
  });

  const response = await fetch(
    `${getBaseUrl()}/buckets/${encodeURIComponent(bucketId)}/events?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `ActivityWatch events request failed (${response.status}) for ${bucketId}`
    );
  }

  return (await response.json()) as ActivityWatchEvent[];
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
