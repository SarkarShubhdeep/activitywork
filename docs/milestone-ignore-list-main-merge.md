# Milestone: ignore list & persistent app catalog (merge checkpoint to `main`)

**Date:** 2026-04-06  
**Branch:** `feature/ignore-list` (ongoing work continues here after this merge)  
**Intent:** Record what shipped up to the point this work is merged into `main`.

---

## Summary

ActivityWork now keeps a **cumulative list of application names** seen from ActivityWatch over time (not only the last 10 minutes), persists them in **local SQLite**, and lets users **ignore / unignore** apps from the Tracked Apps UI. Catalog reads are fast (DB-only); ActivityWatch is polled on a **slower interval** with **visibility-aware** syncing to reduce load.

---

## Data & storage

- **Prisma schema:** `KnownApp` and `IgnoredApp` models plus migration `20260406131913_known_app_ignored_app`.
- **Runtime catalog:** `better-sqlite3` with `CREATE TABLE IF NOT EXISTS` for `KnownApp` / `IgnoredApp` so the app does not depend on Prisma migrations for those tables at request time.
- **Path resolution:** `lib/sqlite-path.ts` — resolves DB file via `CATALOG_SQLITE_PATH`, `DATABASE_URL` (`file:…`), or default `prisma/dev.db` under the package root (avoids wrong cwd / duplicate `dev.db` confusion).
- **Optional Prisma client:** `lib/prisma.ts` uses the same resolved SQLite URL for future use (e.g. `ActivityRecord`).
- **Git:** Local `*.db` / WAL sidecars ignored; `prisma/dev.db` no longer tracked in version control.

---

## APIs

| Method | Route | Role |
|--------|--------|------|
| `GET` | `/api/apps/catalog` | List known apps + `ignored` flags (SQLite only). |
| `POST` | `/api/apps/catalog/sync` | Pull recent ActivityWatch events (same bucket/query params as preview), merge into catalog, return updated list + merge stats. |
| `POST` | `/api/apps/ignore` | Body `{ appName }` — add to ignore list (validated). |
| `DELETE` | `/api/apps/ignore?appName=…` | Remove from ignore list. |

---

## ActivityWatch hardening

- **Timeouts** on fetches (default ~12s) via `AbortSignal.timeout`.
- **Bounded concurrency** (default 2) for per-bucket event fetches (`fetchEventsForBuckets`), used by preview and tracked-apps routes.

---

## UI

- **Tracked Apps** (`tracked-windows-placeholder.tsx`): loads catalog immediately, syncs from ActivityWatch on mount and about every **60s** while the tab is visible; refreshes on `storage` when source preferences change.
- **Table** (`tracked-windows-table.tsx`): context menu **Ignore app** / **Unignore app**; visual state for ignored rows.

---

## Dependencies

- `better-sqlite3` (with `serverExternalPackages` in `next.config.ts`).

---

## Follow-ups (not in this checkpoint)

- Optional: filter **live preview feed** by ignored app names.
- Optional: single client-side coordinator to dedupe preview + catalog ActivityWatch traffic (phase 2).
- Pagination for very large `KnownApp` tables if needed.

---

## Merge note

After merging this checkpoint into `main`, **continue feature development on `feature/ignore-list`** (or a new branch from `main`) so history stays clear.
