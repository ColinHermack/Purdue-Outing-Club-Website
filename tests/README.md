# Tests

Tests use [Vitest](https://vitest.dev/) and are split into two suites, configured as two projects in
`vitest.config.mts`.

## Unit tests (`tests/unit/`)

Fast tests with every outside dependency mocked: the database (`pg`), the NextAuth session, and the miniservices when
testing route handlers. They never touch a real database and don't need a `.env` file.

```bash
npm test
```

- The folder layout mirrors the source tree. `tests/unit/app/api/protected/tripleaders.test.ts` tests
  `app/api/protected/tripleaders/route.ts`.
- Shared fakes live in `tests/unit/helpers.ts`: `pgModule`/`pgClient` for mocking `pg`, `session()`, `jsonRequest()`,
  and `memberRow()`. Reuse them instead of writing new mocks.
- `mockReset` is on, so set mock return values inside each test, not at the top of the file.
- Route handler tests mock `next-auth/next` and the miniservices, then call the exported `GET`/`POST`/`PUT` directly.
- `tests/unit/openapi.test.ts` fails when `app/api` and `public/openapi.json` disagree. Update the spec when you add or
  change a route.

## Integration tests (`tests/integration/`)

These run the real miniservices and route handlers against a throwaway Postgres database, so they catch broken SQL,
schema drift and mapping bugs that mocks can't. Only the NextAuth session is mocked, since Microsoft sign-in can't run
in a test.

They need [Docker](https://www.docker.com/products/docker-desktop/). Start the test database, then run the suite:

```bash
npm run test:db
```

```bash
npm run test:integration
```

`npm run test:db` starts Postgres 14 (the production version) on port 5433 using `docker-compose.test.yml`, with SSL on
because every miniservice pool forces SSL. Before the suite runs, `globalSetup.ts` rebuilds the schema and loads the
fixtures. Tests that write data call `resetDb()` from `tests/integration/db.ts` in `beforeEach`. Stop the database
with:

```bash
docker compose -f docker-compose.test.yml down
```

The suite is hard-coded to `localhost` in `vitest.config.mts` and refuses to run against any other host, because it
wipes every table.

| File | Purpose |
| --- | --- |
| `schema.sql` | Schema-only dump of the production database (no rows). |
| `seed.sql` | Fixture rows. **Only fake data, never real member information.** Write dates relative to `CURRENT_DATE` (for example `(CURRENT_DATE + 180)::text`) so fixtures never expire. |
| `db.ts` | `resetDb()` and the test pool. |
| `globalSetup.ts` | Loads `schema.sql` and `seed.sql` before the run. |

### Updating the schema after a database change

Regenerate `schema.sql` with the database credentials from `.env`. It dumps structure only, never data:

```bash
pg_dump --schema-only --no-owner --no-privileges --schema=public \
  -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_DATABASE> > tests/integration/schema.sql
```

Then update `seed.sql` and the tests for the new columns. The full checklist is in
[docs/systems/database.md](../docs/systems/database.md#changing-the-schema).

## What to test

- New miniservice SQL gets an integration test.
- New route auth or validation branches get unit tests.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on every push to `main`. It runs, in order:

1. ESLint (`npx eslint .`)
2. Typecheck (`npm run typecheck`)
3. Unit tests
4. Integration tests against a Postgres container
5. `npm run build`, pointed at the seeded test database, because some pages query the database while building

The test database uses passwordless `trust` auth and CI sets no credentials, so no repository secrets are needed. A
pull request must pass CI before review.
