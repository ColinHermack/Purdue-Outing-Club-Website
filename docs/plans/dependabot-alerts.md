# Resolve open Dependabot alerts

## Context

`ColinHermack/Purdue-Outing-Club-Website` has 37 open Dependabot alerts (#33 to #73). Several are critical unauthenticated RCEs in `next`, which runs in production on Vercel. Every alert has a patched version available, so one PR can close all of them. Three flagged packages are not imported anywhere and can be deleted outright.

(Per global CLAUDE.md, the first step after approval is to copy this plan to `docs/plans/dependabot-alerts.md` in the repo.)

## Severity assessment

| Package | Alerts | Worst | Installed | Fixed | Real exposure |
|---|---|---|---|---|---|
| `next` | 41, 42, 51, 59-63, 69-71 | critical (RCE x5, SSRF, DoS, cache poisoning) | 16.2.12 | 16.4.4 | **High.** Prod runtime. Vercel runs its own image optimizer, which blunts the image-API RCEs, but the Server Actions DoS, `next/og` and cache poisoning issues still apply. Fix first. |
| `@azure/msal-node` | 72, 73 | high | 5.4.2 | 7.1.0 | **None.** Not imported anywhere (auth goes through next-auth). Delete it instead of doing a two-major upgrade. |
| `sharp` | 40, 58 | high | 0.35.3 | 0.35.5 | Low on Vercel (only used by self-hosted image optimization). Pinned by the `overrides` block. |
| `js-yaml` 3.x | 35, 43 | high | 3.15.0 | 3.15.2 | **None.** Only pulled in by `gray-matter`, which is unused. Delete it. |
| `js-yaml` 4.x | 36, 44 | high | 4.3.0 | 4.3.2 | Low. Only reached through eslint, parsing trusted config. |
| `brace-expansion` 1.x / 5.x | 33, 34, 39, 45-50 | high (DoS) | 1.1.16 / 5.0.8 | 1.1.21 / 5.0.12 | Low. Only reached through eslint and typescript-eslint, on trusted globs. Flagged as "runtime" because `typescript-eslint` sits in `dependencies`. |
| `source-map-js` | 52 | high (DoS) | 1.2.1 | 1.2.2 | Low. Build-time only (postcss/tailwind). |
| `vite`, `@vitest/mocker` | 55-57, 64-68 | high/medium | 8.3.1 / 4.1.11 | 8.3.3+ / 4.1.12 | Low. Dev/test only, and most issues are Windows-only. Trivial bump. |

Every alert counts as pertinent: the low-exposure ones only need a lockfile refresh, so fixing them costs less than triaging and dismissing them.

## Plan (one branch, one PR)

1. Branch off fresh main: `git switch main && git pull && git switch -c fix/dependabot-alerts`.
2. Delete unused packages (none are imported; I checked with grep): `npm uninstall @azure/msal-node @azure/msal-browser gray-matter`. Closes 35, 43, 72, 73. `msal-browser` is not flagged, but it is the unused sibling of `msal-node`.
3. Bump direct deps:
   - `npm install next@^16.4.4`
   - `npm install -D @next/eslint-plugin-next@^16.4.4 vitest@^4.1.12`
4. Delete the `overrides` block in `package.json`. next 16.4.4 already ships `postcss` 8.5.23 (newer than the overridden `^8.5.14`) and requires `sharp ^0.35.5`, so both overrides are now redundant. If `npm ls sharp postcss` still shows an old version afterward, set the overrides to `^0.35.5` / `^8.5.23` instead.
5. Refresh transitive deps within their existing ranges: `npm update brace-expansion js-yaml source-map-js vite`.
6. Confirm with `npm ls next sharp brace-expansion js-yaml source-map-js vite @vitest/mocker --all` and `npm audit` that every version is at or above the fixed version in the table.

Files touched: `package.json`, `package-lock.json` only.

Skipped:
- Moving `typescript-eslint` to devDependencies. It would make Dependabot's runtime/dev labels accurate, but it changes no risk. Do it whenever.
- Removing the `fs` placeholder package. It is not flagged and is out of scope.
- Enabling CodeQL and secret scanning. Neither is on right now. Turn them on separately if wanted.

## Verification

- `npx eslint .`, `npm run typecheck`, `npm test`
- `npm run test:db && npm run test:integration`
- `npm run build` against the seeded test DB (this exercises prerendered DB pages on the new Next)
- `npm run dev` smoke test: `/pleadership` (uses `next/image`), `/news/[slug]` (remark), `/calendar`, then sign in and open `/dashboard`
- CI green on the PR, and the Vercel preview loads
- After merge: `gh api "repos/{owner}/{repo}/dependabot/alerts?state=open"` returns `[]`
