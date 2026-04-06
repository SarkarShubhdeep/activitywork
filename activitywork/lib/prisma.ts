import { PrismaClient } from "@/app/generated/prisma/client";
import { resolvedDatabaseUrlForPrisma } from "@/lib/sqlite-path";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Optional Prisma client (e.g. future `ActivityRecord` ingest). Uses the same
 * SQLite file path as the app catalog — see `lib/sqlite-path.ts`.
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: resolvedDatabaseUrlForPrisma(),
            },
        },
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
