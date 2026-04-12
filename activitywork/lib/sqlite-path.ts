import fs from "node:fs";
import path from "node:path";

/**
 * App package root (directory containing `prisma/schema.prisma`).
 */
export function resolvePackageRoot(): string {
    const explicit = process.env.ACTIVITYWORK_PACKAGE_ROOT?.trim();
    if (explicit) {
        return explicit;
    }

    let dir = process.cwd();
    for (let i = 0; i < 8; i++) {
        const schemaPath = path.join(dir, "prisma", "schema.prisma");
        if (fs.existsSync(schemaPath)) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }

    return process.cwd();
}

/**
 * Absolute path to the SQLite file used for KnownApp / IgnoredApp (and optional Prisma).
 *
 * 1. `CATALOG_SQLITE_PATH` — absolute, or relative to package root
 * 2. `DATABASE_URL` — `file:...` resolved relative to package root
 * 3. Default — `prisma/dev.db` under package root (matches common Prisma layout)
 */
export function resolveSqliteDatabaseFilePath(): string {
    const root = resolvePackageRoot();

    const catalogPath = process.env.CATALOG_SQLITE_PATH?.trim();
    if (catalogPath) {
        return path.isAbsolute(catalogPath)
            ? catalogPath
            : path.resolve(root, catalogPath);
    }

    const raw = process.env.DATABASE_URL?.trim();
    if (raw?.startsWith("file:")) {
        let filePath = raw.slice("file:".length);
        if (filePath.startsWith("//")) {
            filePath = filePath.replace(/^\/\/+/, "/");
        }
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.resolve(root, filePath);
    }

    return path.join(root, "prisma", "dev.db");
}

/** Prisma expects a `file:` URL string. */
export function resolvedDatabaseUrlForPrisma(): string {
    return `file:${resolveSqliteDatabaseFilePath()}`;
}
