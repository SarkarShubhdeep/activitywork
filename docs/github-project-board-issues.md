# ActivityWork — GitHub Project board issue titles

Use these as **issue titles** when creating work items for your ActivityWork project board. Status columns match a typical flow: **Planned** (roadmap / not yet triaged), **Backlog**, **Ready**, **In progress**, **In review**, **Done**.

Copy titles into GitHub Issues, then add them to the project and set the board column.

---

## Planned

High-level roadmap; not yet broken into sprint-sized backlog items.

- ActivityWork as full intermediary between ActivityWatch and TimeHarbor (architecture alignment)
- End-to-end local pipeline: ingest → SQLite → downstream TimeHarbor handoff
- Parity review against legacy `timeharbor-old` for migration gaps

---

## Backlog

Acknowledged work; not ready to pick up or waiting on dependencies.

- Persist ActivityWatch events to SQLite via Prisma (`ActivityRecord` write path)
- Configurable ActivityWatch time window (beyond fixed 10-minute client window)
- TimeHarbor integration: export API, webhook, or batch sync (TBD)
- Automated tests: API route + ActivityWatch client mocks
- CI workflow: lint and build on pull requests
- Operational docs: production-like runbook (if non-local deploy is in scope)

---

## Ready

Scoped and unblocked; can be picked up next.

- UI: empty and error states when ActivityWatch is unreachable or has no buckets
- UI: explicit poll interval control or manual refresh for preview feed
- API: document query parameters (`bucketId`, `bucketIds`, `watcherCategories`, `limit`) in repo docs

---

## In progress

Actively being worked (adjust to match your team’s real assignments).

- Home shell: watcher / bucket source preferences (auto, default priority, manual ID, multi-select filters)

---

## In review

Implemented; awaiting review or QA before closing.

- Preview API: multi-bucket reads, merged events, and watcher category query support
- Preview console: polling, live update logging, and feed tied to selected sources

---

## Done

Shipped in the current codebase (MVP / foundation).

- Next.js 16 app (App Router) on port 5601 with TypeScript and Tailwind CSS 4
- Landing / home experience with resizable layout shell
- `GET /api/aw/preview` ActivityWatch proxy and JSON response shape
- ActivityWatch client: `fetchBuckets`, `fetchBucketEvents`, preferred bucket selection
- Prisma schema and SQLite migration for `ActivityRecord` (database layer ready)
- Watcher bucket discovery exposed in preview API responses for inspection and testing

---

## Notes

- Reconcile **In progress** / **In review** with your open PRs: move items when work starts or when PRs open.
- **Planned** can live as a separate view or as unassigned issues without a status column if your board only has the five workflow columns.
- After creating issues in GitHub, link this file only for internal reference; the board is the source of truth for current status.

