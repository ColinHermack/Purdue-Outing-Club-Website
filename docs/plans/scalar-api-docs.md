# Scalar API Docs

## Context

The app has 15 hand-rolled route handlers under `app/api/` and no API documentation. Add a Scalar API
reference that works on local dev (`https://localhost:3000`), every Vercel preview, and production, with no
per-environment config. Decisions: **public** (no sign-in), spec **hand-written** as one OpenAPI JSON file,
guarded by a unit test so it can't silently drift from the routes.

## Step 0

Copy this plan to `docs/plans/scalar-api-docs.md` (user rule: plans live in the repo).

## Changes

### 1. Dependency

`npm install @scalar/nextjs-api-reference` (currently 0.12.11). Only new dependency.

### 2. `public/openapi.json` (new)

OpenAPI 3.1, served statically at `/openapi.json` by Next.js.

- `servers: [{ "url": "/" }]` so "Try it" hits the current origin (localhost, preview, prod) automatically.
- `info.title`: "Purdue Outing Club API".
- Tags: `Public`, `Members` (protected, session), `Officers` (protected, position-gated), `Automation`.
- `components.securitySchemes`:
  - `session`: `apiKey` in cookie `__Secure-next-auth.session-token` (all envs run HTTPS, so NextAuth uses the
    `__Secure-` name). Description: sign in on the site first; same-origin requests send the cookie.
  - `duesApiKey`: `http` / `bearer`, for `/api/automation/dues`.
- `components.schemas` built from the DTOs (camelCase, all optional like the classes): `MemberDTO` (+ nested
  `FirstAidData`, `EmergencyData`, `MedicalData`), `BasicMemberDTO`, `MemberDirectoryEntryDTO` (`duesStatus`
  enum `paid|expired|none`), `TripDTO`, `TripLeaderDTO`, `CreateTripLeaderDTO` (also used for PUT body, same shape
  as `UpdateTripLeaderDTO`), `NewsPreviewDTO`, `OfficerDTO` not needed. Plus `GearHours` (`config/types.ts`
  `GearHoursDataT`), `LeaderboardEntry` (`{name, count}`), `DuesResult` (`{email, type, expires, created}`).
- Paths, documenting status codes exactly as each handler returns them (including the existing 401/403 swap):
  - Public: `GET /api/healthcheck` (text), `/api/gear/hours`, `/api/leaderboard/led`, `/api/leaderboard/total`,
    `/api/news/recent`, `/api/trips/open`, `GET /api/azure-signout` (302 to Microsoft logout).
  - Members (`session`): `GET /api/protected/user`, `/api/protected/user/trips`, `/api/protected/membership`,
    `/api/protected/memberdirectory` (trip leaders only).
  - Officers (`session`): `GET /api/protected/members`, `GET|POST|PUT /api/protected/tripleaders`
    (`GET_TRIP_LEADERS_AUTHORIZED_POSITIONS`), `GET /api/protected/memberexport` (`text/csv`,
    `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`). Name the position constants from `config/permissions.ts` in
    descriptions rather than copying the lists.
  - Automation (`duesApiKey`): `POST /api/automation/dues`, body `{email, receipt}` (receipt = base64 PDF),
    responses 200/201/400/401/422/500.
  - Note on every protected op: without a session, `proxy.ts` answers 307 to `/api/auth/signin` before the handler runs.
- NextAuth's own `/api/auth/*` routes are left out (library-owned).

### 3. `app/api/docs/route.ts` (new)

```ts
/**
 * Serves the Scalar API reference for public/openapi.json. Public in every environment.
 *
 * @author Colin Hermack
 */

import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  pageTitle: "Purdue Outing Club API",
  // Pinned so a Scalar release can't change prod without a PR.
  cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.72.4",
});
```

Reachable at `/api/docs`. Not added to the `proxy.ts` matcher (stays public). No CSP exists in the app, so no
nonce work. Avoids `/docs`, which `public/docs/*.pdf` already uses.

### 4. `tests/unit/openapi.test.ts` (new): drift check

Reads files only, no imports of route modules (they pull in `pg` / `next-auth`):

- Walk `app/api/**/route.ts` with `fs.readdirSync(..., { recursive: true })`, skip `auth/[...nextauth]` and
  `docs`.
- Per file, collect exported methods via regex on `export (async function|const) (GET|POST|PUT|PATCH|DELETE)`.
- Map dir to path (`app/api/protected/user/route.ts` to `/api/protected/user`).
- Assert the set of `"METHOD path"` pairs equals the set from `public/openapi.json` `paths`. Failure message lists
  missing/extra entries.
- Also assert every `$ref` in the spec resolves to a key in `components.schemas`.

### 5. `CLAUDE.md`

One line under Conventions: new or changed `app/api` routes need a matching entry in `public/openapi.json`;
`tests/unit/openapi.test.ts` enforces it; UI at `/api/docs`.

## Skipped

- Navbar link: dev-facing page, add to `config/site.ts` if wanted.
- Generated spec (zod etc.): add if the hand-written file becomes painful to keep in sync.

## Verification

1. `npm test`: new drift test passes; temporarily delete one path from the spec, confirm it fails, restore.
2. `npx eslint .` and `npm run typecheck`.
3. `npm run dev`, open `https://localhost:3000/api/docs`: all 4 tags render, schemas expand.
   "Try it" on `GET /api/healthcheck` returns 200; sign in on the site, then "Try it" on
   `GET /api/protected/user` returns your member JSON (cookie sent same-origin).
4. Check `https://localhost:3000/openapi.json` loads directly.
5. `npm run build` (CI does this against the seeded DB).
6. After pushing: open `<preview-url>/api/docs` on the Vercel preview; "Try it" on healthcheck hits the preview
   origin, not prod. Production checked after merge at `/api/docs`.
