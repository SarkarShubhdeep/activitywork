import { NextResponse } from "next/server";

import { addIgnoredAppSqlite, removeIgnoredAppSqlite } from "@/lib/catalog-sqlite";
import { normalizeAppNameForStorage } from "@/lib/catalog-app-name";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { ok: false, error: "Invalid JSON body" },
                { status: 400 },
            );
        }

        const raw =
            typeof body === "object" &&
            body !== null &&
            "appName" in body &&
            typeof (body as { appName: unknown }).appName === "string"
                ? (body as { appName: string }).appName
                : "";

        const appName = normalizeAppNameForStorage(raw);
        if (!appName) {
            return NextResponse.json(
                { ok: false, error: "Invalid or missing appName" },
                { status: 400 },
            );
        }

        addIgnoredAppSqlite(appName);

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const raw = url.searchParams.get("appName") ?? "";
        const appName = normalizeAppNameForStorage(raw);
        if (!appName) {
            return NextResponse.json(
                { ok: false, error: "Invalid or missing appName" },
                { status: 400 },
            );
        }

        removeIgnoredAppSqlite(appName);

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}
