# ActivityWork

ActivityWork is a fully local Next.js application that acts as an intermediary module between ActivityWatch and Timeharbor.

It receives and organizes local activity events, stores them in a local SQLite database, and prepares them for downstream processing between both systems without relying on any cloud service.

<img src="./activitywork/assets/activity-work-diagram.png" alt="ActivityWork Diagram" width="600" style="max-width: 100%; height: auto;" />

## Project layout

The Next.js app lives in [`activitywork/`](./activitywork/).

## Tech stack

- Next.js 16 (App Router, Route Handlers)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM
- SQLite (local development database)
- ESLint

## Milestones

- **2026-04-06 — Persistent app catalog & ignore list (merge checkpoint):** Shipped on `feature/ignore-list`. Details: [docs/milestone-ignore-list-main-merge.md](./docs/milestone-ignore-list-main-merge.md). Further work can continue on that branch after merging to `main`.

## Current features

- Landing page at `/` for plugin status and quick validation.
- Live preview API at `/api/aw/preview`.
- ActivityWatch client utilities in `activitywork/lib/activitywatch-client.ts`.
- Browser console tracking via `activitywork/app/preview-console.tsx`:
  - Polls every 5 seconds
  - Logs `ActivityWatch live update:` when newer events are detected
- Watcher discovery in preview response (`buckets`) so you can inspect available sources.
- Tracked Apps: cumulative app catalog in SQLite, `GET /api/apps/catalog`, `POST /api/apps/catalog/sync`, ignore/unignore APIs, and UI on the Tracked Apps page (see milestone doc above).

## ActivityWatch preview behavior

The preview endpoint prefers watcher buckets in this order when a specific bucket is not provided:

1. `aw-watcher-window`
2. `aw-watcher-web`
3. `aw-watcher-vscode`
4. `aw-watcher-afk`
5. first available bucket

You can also force a bucket manually:

```bash
curl "http://localhost:5601/api/aw/preview?bucketId=<bucket-id>&limit=50"
```

## Local development

```bash
cd activitywork
npm install
npm run dev
```

Open [http://localhost:5601](http://localhost:5601).

SQLite is configured through Prisma and runs locally using `DATABASE_URL` in `activitywork/.env`.

## Local services

- **ActivityWatch** runs on [http://localhost:5600](http://localhost:5600)
- **ActivityWork** runs on [http://localhost:5601](http://localhost:5601)
- **TimeHarbor** runs on [http://localhost:3000](http://localhost:3000)
- Legacy **timeharbor-old** repository is in this workspace for reference and migration work.

## Quality checks

```bash
cd activitywork
npm run lint
npm run build
```

## Current MVP status

- Landing page at `/` for the ActivityWork plugin flow.
- ActivityWatch preview endpoint at `/api/aw/preview`.
- Browser-console tracking that polls preview data every 5 seconds and logs live updates.
- Watcher bucket discovery in API responses for testing.
