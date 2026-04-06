import { NextResponse } from "next/server";

import { loadCatalogForResponse } from "@/lib/apps-catalog";

export const runtime = "nodejs";

export async function GET() {
    try {
        const { apps } = await loadCatalogForResponse();
        return NextResponse.json({ ok: true, apps });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}
