import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * With `turbopack.root` set to this app, bare imports must resolve under this
 * package's `node_modules`, not a parent monorepo root (avoids MODULE_NOT_FOUND
 * for lucide-react, react-resizable-panels, radix-ui, etc.).
 */
function turbopackDependencyAliases(rootDir: string): Record<string, string> {
    const pkgPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
        dependencies?: Record<string, string>;
    };

    const doNotAlias = new Set([
        "next",
        "react",
        "react-dom",
    ]);

    const aliases: Record<string, string> = {};
    for (const name of Object.keys(pkg.dependencies ?? {})) {
        if (doNotAlias.has(name)) continue;
        aliases[name] = `./node_modules/${name}`;
    }
    return aliases;
}

const nextConfig: NextConfig = {
    devIndicators: false,
    serverExternalPackages: ["better-sqlite3"],
    turbopack: {
        root: configDir,
        resolveAlias: turbopackDependencyAliases(configDir),
    },
};

export default nextConfig;
