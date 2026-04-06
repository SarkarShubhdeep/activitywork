import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import type { AggregatedTrackedApp } from "@/lib/aw-tracked-apps";
import type { CatalogAppRow } from "@/lib/catalog-types";
import {
    KNOWN_APP_TITLE_MAX_LEN,
    type MergeKnownAppsResult,
    normalizeAppNameForStorage,
} from "@/lib/catalog-app-name";
import { resolveSqliteDatabaseFilePath } from "@/lib/sqlite-path";

const globalForSqlite = globalThis as unknown as {
    catalogDb: Database.Database | undefined;
};

function truncateTitle(raw: string): string | null {
    const t = raw.trim();
    if (t.length === 0) return null;
    if (t.length <= KNOWN_APP_TITLE_MAX_LEN) return t;
    return t.slice(0, KNOWN_APP_TITLE_MAX_LEN);
}

function ensureParentDir(filePath: string) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
}

function ensureCatalogSchema(database: Database.Database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS "KnownApp" (
            "appName" TEXT NOT NULL PRIMARY KEY,
            "firstSeenAt" TEXT NOT NULL,
            "lastSeenAt" TEXT NOT NULL,
            "lastTitle" TEXT
        );
        CREATE TABLE IF NOT EXISTS "IgnoredApp" (
            "appName" TEXT NOT NULL PRIMARY KEY
        );
    `);
}

export function getCatalogDatabase(): Database.Database {
    if (globalForSqlite.catalogDb) {
        return globalForSqlite.catalogDb;
    }

    const filePath = resolveSqliteDatabaseFilePath();
    ensureParentDir(path.dirname(filePath));

    const database = new Database(filePath);
    database.pragma("journal_mode = WAL");
    ensureCatalogSchema(database);

    globalForSqlite.catalogDb = database;

    return database;
}

export function mergeKnownAppsIntoCatalog(
    apps: AggregatedTrackedApp[],
): MergeKnownAppsResult {
    const db = getCatalogDatabase();
    let skippedInvalid = 0;
    const normalized: AggregatedTrackedApp[] = [];

    for (const row of apps) {
        const appName = normalizeAppNameForStorage(row.appName);
        if (!appName) {
            skippedInvalid += 1;
            continue;
        }
        const lastTitleRaw = truncateTitle(row.lastTitle) ?? appName;
        const lastSeenAtMs = Number.isFinite(row.lastSeenAtMs)
            ? row.lastSeenAtMs
            : 0;
        normalized.push({
            appName,
            lastTitle: lastTitleRaw,
            lastSeenAtMs,
        });
    }

    if (normalized.length === 0) {
        return { inserted: 0, updated: 0, skippedInvalid };
    }

    const byName = new Map<string, AggregatedTrackedApp>();
    for (const row of normalized) {
        const prev = byName.get(row.appName);
        if (!prev || row.lastSeenAtMs >= prev.lastSeenAtMs) {
            byName.set(row.appName, row);
        }
    }
    const unique = [...byName.values()];
    const names = unique.map((r) => r.appName);

    const ph = names.map(() => "?").join(", ");
    const existingRows = db
        .prepare(
            `SELECT "appName", "lastSeenAt" FROM "KnownApp" WHERE "appName" IN (${ph})`,
        )
        .all(...names) as { appName: string; lastSeenAt: string }[];

    const existingMap = new Map(
        existingRows.map((r) => [
            r.appName,
            new Date(r.lastSeenAt).getTime(),
        ] as const),
    );

    const insertStmt = db.prepare(
        `INSERT INTO "KnownApp" ("appName", "firstSeenAt", "lastSeenAt", "lastTitle")
         VALUES (?, ?, ?, ?)`,
    );
    const updateStmt = db.prepare(
        `UPDATE "KnownApp" SET "lastSeenAt" = ?, "lastTitle" = ?
         WHERE "appName" = ? AND "lastSeenAt" < ?`,
    );

    const run = db.transaction(() => {
        let inserted = 0;
        let updated = 0;

        for (const row of unique) {
            const lastIso = new Date(row.lastSeenAtMs).toISOString();
            const prevMs = existingMap.get(row.appName);

            if (prevMs === undefined) {
                insertStmt.run(
                    row.appName,
                    lastIso,
                    lastIso,
                    row.lastTitle,
                );
                inserted += 1;
            } else if (row.lastSeenAtMs > prevMs) {
                const info = updateStmt.run(
                    lastIso,
                    row.lastTitle,
                    row.appName,
                    lastIso,
                );
                updated += info.changes;
            }
        }

        return { inserted, updated, skippedInvalid };
    });

    return run();
}

export function loadCatalogFromSqlite(): { apps: CatalogAppRow[] } {
    const db = getCatalogDatabase();
    const rows = db
        .prepare(
            `SELECT k."appName" AS appName, k."firstSeenAt" AS firstSeenAt, k."lastSeenAt" AS lastSeenAt, k."lastTitle" AS lastTitle,
                    CASE WHEN i."appName" IS NOT NULL THEN 1 ELSE 0 END AS ignored
             FROM "KnownApp" k
             LEFT JOIN "IgnoredApp" i ON i."appName" = k."appName"
             ORDER BY k."appName" ASC`,
        )
        .all() as Array<{
        appName: string;
        firstSeenAt: string;
        lastSeenAt: string;
        lastTitle: string | null;
        ignored: number;
    }>;

    return {
        apps: rows.map((r) => ({
            appName: r.appName,
            firstSeenAt: r.firstSeenAt,
            lastSeenAt: r.lastSeenAt,
            lastTitle: r.lastTitle ?? "",
            ignored: r.ignored === 1,
        })),
    };
}

export function addIgnoredAppSqlite(appName: string) {
    const db = getCatalogDatabase();
    db.prepare(
        `INSERT OR IGNORE INTO "IgnoredApp" ("appName") VALUES (?)`,
    ).run(appName);
}

export function removeIgnoredAppSqlite(appName: string) {
    const db = getCatalogDatabase();
    db.prepare(`DELETE FROM "IgnoredApp" WHERE "appName" = ?`).run(appName);
}
