# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with HTTPS (`--experimental-https`). Serves on `https://localhost:3000/`; the HTTPS URL is required because `NEXTAUTH_URL` and the Azure AD redirect URI are both registered as HTTPS.
- `npm run build`: production build. Needs a reachable DB, because some pages (`/pleadership`, `/sponsorship`, `/diversity`, `/supportus`, `/trips/[id]`) query it while prerendering.
- `npm run start`: run the built app.
- Lint: `npx eslint .` (flat config in `eslint.config.mts`). `npm run lint` also runs `prettier --write` and `eslint --fix`, so it rewrites files; CI uses plain `npx eslint .`.
- `npm run typecheck`: `tsc --noEmit`.
- `npm test`: Vitest unit suite (`tests/unit/`). Everything mocked, no DB or `.env` needed.
- `npm run test:db` then `npm run test:integration`: Vitest integration suite (`tests/integration/`) against Postgres 14 in Docker (`docker-compose.test.yml`, port 5433, SSL on because every miniservice pool forces SSL). Schema comes from `tests/integration/schema.sql` (a `pg_dump --schema-only` of prod), fixtures from `seed.sql` (fake data only, dates relative to `CURRENT_DATE`). Tests that write call `resetDb()` from `tests/integration/db.ts` in `beforeEach`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit, integration, then build against the seeded test DB on every PR.

### Testing conventions

- Unit test paths mirror source paths under `tests/unit/`. Reuse the fakes in `tests/unit/helpers.ts` (`pgModule`/`pgClient` for mocking `pg`, `session()`, `jsonRequest()`, `memberRow()`); `mockReset` is on, so set mock return values inside each test.
- Route handler tests mock `next-auth/next` and the miniservices, then call the exported `GET`/`POST`/`PUT` directly. Integration tests mock only `next-auth/next`.
- New miniservice SQL gets an integration test; new route auth/validation branches get unit tests.

## Architecture

This is a Next.js 16 App Router project (in `app/`) using TypeScript, HeroUI v3 (recently migrated from v2 — see commit `8f6ff3c`), Tailwind, and `next-themes`. The path alias `@/*` maps to the repo root.

### Request layers

The code is intentionally split into four layers; new database-backed features should follow the same flow rather than collapsing layers:

1. **`models/`** — TypeScript classes that mirror a single database table row (snake_case → camelCase fields). Used internally when interacting with the DB.
2. **`miniservices/`** — server-only (`"use server"`) modules that own a `pg.Pool` and execute SQL. Each miniservice creates its own pool from `DB_*` env vars (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`), with `ssl.rejectUnauthorized = false`. They JOIN across tables when needed and shape rows into DTOs before returning.
3. **`dtos/`** — DTO classes returned across the server/client boundary (camelCase). DTOs may embed other DTOs (e.g. `TripLeaderDTO.member: MemberDTO`).
4. **`app/api/.../route.ts`** — Next.js route handlers. They call into miniservices and serialize DTOs to JSON.

### Authentication and authorization

- Auth is **NextAuth + Azure AD** (Microsoft work/school accounts), configured in `app/api/auth/[...nextauth]/options.ts`. The `signIn` callback rejects anyone whose email is not present in the `member` table (`verifyMembershipByEmail`). Session strategy is JWT.
- `proxy.ts` is the NextAuth middleware. Its `matcher` is the source of truth for which routes require a session: currently `/api/protected/:path*` and `/dashboard`. Add new gated routes here, not by sprinkling checks elsewhere.
- Route-level **role authorization** lives in `config/permissions.ts` as arrays of officer position titles (e.g. `GET_TRIP_LEADERS_AUTHORIZED_POSITIONS`). Protected routes call `getOfficerDataByEmail(session.user.email)` and check `officer.position` against the relevant array (see `app/api/protected/tripleaders/route.ts` for the pattern). When adding a new protected endpoint, add a new constant in `permissions.ts` rather than inlining the role list.

### App layout

`app/layout.tsx` wraps every page in `AuthProvider` → `Providers` (HeroUI + next-themes, light by default) → `Navbar` / `Footer`. Most user-facing routes are public marketing/informational pages (`/calendar`, `/trips`, `/pleadership`, `/faq`, `/gearcloset`, etc., all enumerated in `config/site.ts`); the authenticated surface is `/dashboard` and `/tripleadersdashboard`, backed by `/api/protected/*`.

## Conventions worth preserving

- DB columns are `snake_case`; DTOs and models are `camelCase`. Do the conversion in the miniservice's `result.rows.map(...)` — don't leak `snake_case` into DTOs (recent commit `226826f` was specifically a cleanup of this).
- Miniservices use `"use server"` and must not be imported into client components.
- ESLint enforces `import/order` (with a specific group order), `react/jsx-sort-props`, `padding-line-between-statements` (blank line before `return`, blank line after `const`/`let`/`var` blocks), and warns on `no-console`. Prettier is wired through ESLint.

## Environment

A `.env` at the repo root is required (not committed). Keys used by the app: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` / `DB_DATABASE`. New contributors get these from the webmaster.

## Deployment

Deployed on Vercel. Every PR gets a preview deployment; merging to `main` deploys to production. PRs must build successfully and be reviewed by the webmaster before merge (per README).

## HeroUI

For all prompts that mention HeroUI, use HeroUI React documentation from https://heroui.com/react/llms-full.txt. Treat this as the ultimate source of truth on HeroUI.
