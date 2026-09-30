# Unit + Integration Testing and PR CI

## Context

The repo has no tests, no test runner, and no `.github/` workflows. The only PR gate today is the Vercel preview build plus manual review. Goal: add unit tests (fast, fully mocked) and integration tests (real SQL against a throwaway Postgres), and run them plus lint, typecheck and build as a GitHub Action on every pull request. Document it all in `README.md`.

Decisions confirmed with user:
- **Schema source**: `pg_dump --schema-only` of the DB in `.env` (zero rows), committed as a SQL file. Fake fixture rows seeded on top.
- **Layers**: unit + integration only. No component tests, no Playwright.
- **CI**: lint + typecheck + unit + integration + build.

Facts found during exploration that shape the plan:
- Stack is actually Next 16 / React 19 / ESLint 9 flat config (`eslint.config.mts`). CLAUDE.md is stale on this.
- Every miniservice builds its own `pg.Pool` from `DB_*` at import time with `ssl: { rejectUnauthorized: false }`, so pg **always** tries SSL. The test Postgres must have SSL on (no prod code change needed).
- Vitest does not load `.env` into `process.env`, so unit tests can never reach the real DB by accident.
- `app/pleadership`, `sponsorship`, `diversity`, `supportus`, `trips/[id]` are server components that query the DB at build time. CI `next build` must point at the seeded test DB.
- `eslint .` currently has 4 errors (unused `error` in `app/api/protected/members/route.ts:57`, dead shadowed `result` in `verifyMemberIsOfficer`, `miniservices/officerMiniService.ts:468-472`). Must be fixed or CI is red on day one.

## Step 0: Save this plan into the repo

Copy this plan to `docs/plans/testing.md` (user rule: plans live in the repo, alongside `docs/plans/member-directory.md`).

## Step 1: Tooling

- `npm i -D vitest` (only new dependency). Path alias via `resolve.alias: { "@": repoRoot }` in config, no `vite-tsconfig-paths`.
- New `vitest.config.mts` with two `test.projects`:
  - `unit`: `include: ["tests/unit/**/*.test.ts"]`, `environment: "node"`.
  - `integration`: `include: ["tests/integration/**/*.test.ts"]`, `fileParallelism: false`, `globalSetup: "tests/integration/globalSetup.ts"`, `env` hard-coded to the local test DB (`DB_HOST=localhost`, `DB_PORT=5433`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, `DB_DATABASE=poc_test`).
- Tests import `describe/it/expect/vi` from `vitest` explicitly (no globals, so no ESLint/TS globals config changes).
- `package.json` scripts:
  - `"test": "vitest run --project unit"`
  - `"test:integration": "vitest run --project integration"`
  - `"test:db": "docker compose -f docker-compose.test.yml up -d --wait"`
  - `"typecheck": "tsc --noEmit"`
- Update CLAUDE.md "Commands" (remove "no test runner", add the scripts above).

## Step 2: Test database

- **Schema dump** (run once during implementation, schema only, no data):
  `pg_dump --schema-only --no-owner --no-privileges --schema=public > tests/integration/schema.sql` using `.env` creds. Check server version first (`SELECT version()`); local `pg_dump` must be same major or newer, and the container image uses that same major. Hand-trim anything provider-specific that won't load in vanilla Postgres. Keeps the `all_members` / `active_members` views.
- **`docker-compose.test.yml`**: one `postgres:<prod major>` service on host port 5433, SSL on via the image's bundled snakeoil cert (`command: -c ssl=on -c ssl_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem -c ssl_key_file=/etc/ssl/private/ssl-cert-snakeoil.key`), healthcheck `pg_isready`. Same file used locally and in CI (GHA `services:` can't pass command args, so CI runs compose directly).
- **`tests/integration/seed.sql`**: fake rows only, no real member data. Dates computed relative to `CURRENT_DATE` inside `jsonb_build_object(...)` so fixtures never expire. Covers:
  - members: active (paid dues, both agreements, no holds), expired dues, null dues, member with holds, `poc@purdue.edu` service account (must be excluded from directory), members with/without first aid, car (hitch/no hitch), driver data.
  - officers: one "Webmaster" (authorized for trip leaders), one unauthorized position, a gear officer with `GearHours`, officers covering positions the leadership/sponsorship pages query.
  - trip leaders, open/closed trips, `trip_roster` rows for leaderboards and `getTripsByMemberId`.
- **`tests/integration/db.ts`**: `resetDb()` helper (truncate all tables `RESTART IDENTITY CASCADE`, run `seed.sql`) using its own `pg.Client`. Refuses to run unless `DB_HOST` is `localhost`/`127.0.0.1` (guard against wiping prod).
- **`tests/integration/globalSetup.ts`**: same host guard, drop/recreate `public` schema, load `schema.sql`, run `resetDb()` once.

## Step 3: Unit tests (`tests/unit/`, mirrors source paths)

Mocking pattern (define once in `tests/unit/helpers.ts`, reuse):
- `mockPg()`: `vi.mock("pg")` returning a `Pool` whose `connect()` yields a shared fake client with `query` / `release` spies.
- `vi.mock("next-auth/next")` to control `getServerSession`; `vi.mock("@/miniservices/...")` for route tests.
- `jsonRequest(body)` / `badJsonRequest()` builders using `NextRequest`.

Files:
- `utils/difficulty.test.ts`: table-driven: unknown sport returns `""`, in-range level, level above max clamps to last, level 1.
- `app/news/utils.test.ts`: `getPosts()` over real `newsposts/`: sorted newest first, every post has title/postedOn/summary, slug equals filename.
- `config/site.test.ts`: every internal `navItems` / `navMenuItems` href has an `app/<route>/page.tsx` (catches dead nav links).
- `app/api/auth/options.test.ts`: `signIn` callback: member true, non-member false, `verifyMembershipByEmail` throws gives false, missing email checks `""`.
- `miniservices/*.test.ts` (one per miniservice, pg mocked): snake_case to camelCase mapping, capitalized jsonb keys normalized (`first_aid_data.Type` to `firstAidData.type`), null jsonb becomes `undefined`, `sport` string split to array, `getTripLeader` / `getMemberById` return `null` on zero rows, `create/updateTripLeader` return `false` on query error, `client.release()` called on both success and throw, parameterized values passed (not interpolated).
- `app/api/**` route tests (miniservices mocked), one file per route. Pattern shown by `tripleaders.test.ts` (GET/POST/PUT):
  - no session / no email: 403
  - `getOfficerDataByEmail` null: 401; officer with position not in `GET_TRIP_LEADERS_AUTHORIZED_POSITIONS`: 401
  - authorized: 200 with DTO JSON
  - invalid JSON: 400; missing `memberId`: 400; unknown member: 404
  - miniservice returns false / throws: 500
  - Same style for `members`, `membership`, `memberdirectory` (non trip leader 401), `user`, `user/trips`, `gear/hours` (throw gives 500), `trips/open`, `leaderboard/led|total`, `news/recent` (max 3, DTO shape), `healthcheck`.

## Step 4: Integration tests (`tests/integration/`, real SQL)

Only `next-auth/next` is mocked (Azure AD can't run in CI). Route handlers are invoked directly with real miniservices against the seeded DB, so these exercise route + miniservice + SQL + schema together.

- `miniservices/member.test.ts`: `getMemberDirectory` derived fields (`isActive`, `duesStatus` paid/expired/none, `firstAidType` only when unexpired, `carHitch`, `driverCertified`), excludes `poc@purdue.edu`, sorted by name; `verifyMembershipByEmail`; `getMemberByEmail/ById`; leaderboards order.
- `miniservices/officer.test.ts`: `getOfficerDataByEmail`, `getGearHours`, `getLeaderData` / `getLeaderDataByPosition` shapes, `verifyMemberIsOfficer`.
- `miniservices/trip.test.ts`: `getOpenTrips` excludes closed, `getTripData` unknown id is `undefined`, `getTripsByMemberId`.
- `miniservices/tripLeader.test.ts` (`beforeEach(resetDb)`): create then read back round-trips `process` jsonb and `sport`; update changes fields; create for a nonexistent member returns false (FK).
- `api/tripleaders.test.ts` (`beforeEach(resetDb)`): Webmaster session: GET 200 list, POST creates and returns new leader, PUT updates; unauthorized officer 401; unknown member 404.
- `api/memberdirectory.test.ts`, `api/user.test.ts`: trip leader vs non trip leader, unknown email 404.

## Step 5: Fix what the tests/CI would trip on

- Fix the 4 existing ESLint errors (listed in Context).
- `PUT /api/protected/tripleaders` returns an unknown-member message with **no status** (defaults 200) at `app/api/protected/tripleaders/route.ts:~190`. Add `{ status: 404 }` to match POST; test asserts 404.
- Not changing: routes use 403 for "no session" and 401 for "forbidden" (inverted vs HTTP convention). Tests lock current behavior; flipping it could break the dashboards' client code. Separate issue if wanted.

## Step 6: GitHub Action

New `.github/workflows/ci.yml`, `on: pull_request` (plus `push` to `main`), one job on `ubuntu-latest`, Node 22 (Node 20 is EOL; vitest 4 is used instead of 5 because 5 requires Node 22+ types and `@types/node` is pinned to 20):

1. `actions/checkout`, `actions/setup-node` with `cache: npm`, `npm ci`
2. `npx eslint .` (check only, no `--fix`; the `lint` script rewrites files so isn't used in CI)
3. `npm run typecheck`
4. `npm test`
5. `npm run test:db` then `npm run test:integration`
6. `npm run build` with job-level env `DB_*` pointing at the seeded container (prerendered pages query it), plus dummy `NEXTAUTH_SECRET` / `NEXTAUTH_URL` / `AZURE_AD_*` values. No real secrets needed in GitHub.

Recommend (user action, not code): mark the `ci` check as required in branch protection for `main`.

## Step 7: README

Replace "Build locally before creating a pull request" with a "Testing" section:
- Test layout: `tests/unit` (mocked, no DB) vs `tests/integration` (Docker Postgres).
- Commands: `npm test`, `npm run test:db` + `npm run test:integration`, `npm run typecheck`, `npx eslint .`, `npm run build`.
- Prereq: Docker for integration tests.
- Where fixtures live (`tests/integration/seed.sql`), rule: fake data only, dates relative to `CURRENT_DATE`.
- Refreshing `schema.sql` after a DB schema change (the `pg_dump` command).
- CI: what runs on every PR and that it must pass before review.
Also fix the stale "HeroUI v2" link to v3 while there.

## Critical files

New: `vitest.config.mts`, `docker-compose.test.yml`, `.github/workflows/ci.yml`, `tests/unit/**`, `tests/integration/{schema.sql,seed.sql,db.ts,globalSetup.ts,**/*.test.ts}`, `docs/plans/testing.md`.
Modified: `package.json`, `README.md`, `CLAUDE.md`, `app/api/protected/tripleaders/route.ts`, `app/api/protected/members/route.ts`, `miniservices/officerMiniService.ts`.

## Verification

1. `npm test`: all unit tests pass with no DB and no `.env` in play (temporarily rename `.env` to confirm).
2. `npm run test:db && npm run test:integration`: pass against container. Break one SQL column name in a miniservice and confirm an integration test fails, then revert.
3. `npx eslint .`, `npm run typecheck`, and `npm run build` with test-DB env all succeed locally.
4. Push branch, open PR, confirm the `ci` workflow runs and goes green; push a deliberately failing test commit to confirm it goes red, then drop it.
