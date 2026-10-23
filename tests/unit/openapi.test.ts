import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const apiDir = path.join(root, "app/api");
const spec = JSON.parse(
  readFileSync(path.join(root, "public/openapi.json"), "utf8"),
);

// Library-owned NextAuth routes and the docs page itself are not part of the spec.
const SKIPPED = ["auth/[...nextauth]", "docs"];

/** Every "METHOD /path" pair exported by a route handler under app/api. */
function routeOperations(): string[] {
  return (readdirSync(apiDir, { recursive: true }) as string[])
    .filter((file) => path.basename(file) === "route.ts")
    .map((file) => path.dirname(file).split(path.sep).join("/"))
    .filter((dir) => !SKIPPED.includes(dir))
    .flatMap((dir) => {
      const source = readFileSync(path.join(apiDir, dir, "route.ts"), "utf8");
      const methods = source.matchAll(
        /export\s+(?:async\s+function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g,
      );

      return [...methods].map(([, method]) => `${method} /api/${dir}`);
    })
    .sort();
}

/** Every "METHOD /path" pair documented in public/openapi.json. */
function specOperations(): string[] {
  return Object.entries(spec.paths as Record<string, object>)
    .flatMap(([route, operations]) =>
      Object.keys(operations).map(
        (method) => `${method.toUpperCase()} ${route}`,
      ),
    )
    .sort();
}

describe("public/openapi.json", () => {
  it("documents exactly the operations app/api exports", () => {
    expect(specOperations()).toEqual(routeOperations());
  });

  it("only references schemas it defines", () => {
    const refs = JSON.stringify(spec).matchAll(
      /"#\/components\/schemas\/([^"]+)"/g,
    );
    const missing = [...refs]
      .map(([, name]) => name)
      .filter((name) => !(name in spec.components.schemas));

    expect(missing).toEqual([]);
  });
});
