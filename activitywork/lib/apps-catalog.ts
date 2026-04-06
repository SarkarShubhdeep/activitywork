import { loadCatalogFromSqlite } from "@/lib/catalog-sqlite";
import type { CatalogAppRow } from "@/lib/catalog-types";

export type { CatalogAppRow } from "@/lib/catalog-types";

export async function loadCatalogForResponse(): Promise<{
    apps: CatalogAppRow[];
}> {
    return Promise.resolve(loadCatalogFromSqlite());
}
