# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with HTTPS (`--experimental-https`). Serves on `https://localhost:3000/`; the HTTPS URL is required because `NEXTAUTH_URL` and the Azure AD redirect URI are both registered as HTTPS.
- `npm run build` — production build. README instructs contributors to run this locally before opening a PR.
- `npm run start` — run the built app.
- Lint: `npx eslint . --ext .ts,.tsx -c .eslintrc.json --fix`. Note the `lint` key in `package.json` is currently misspelled (wrapped in backticks), so `npm run lint` does not resolve — invoke ESLint directly until that's fixed.

There is no test runner configured in this repo.

## Architecture

This is a Next.js 14 App Router project (in `app/`) using TypeScript, HeroUI v3 (recently migrated from v2 — see commit `8f6ff3c`), Tailwind, and `next-themes`. The path alias `@/*` maps to the repo root.

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
