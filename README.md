# Purdue Outing Club Website

This is a full-stack web application used for the management of Purdue Outing Club trip and member data. Some of the functions of this website are the following.

## Technologies Used

- [Next.js 16](https://nextjs.org/docs/getting-started)
- [HeroUI v3](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Google Calendar](calendar.google.com)

## How to Contribute

### Clone the GitHub repository

Begin by cloning the GitHub repository into a local directory.

```bash
git clone https://github.com/ColinHermack/Purdue-Outing-Club-Website.git
```

### Create environment variables

Get the environment variables from the webmaster and create a .env file in the root of the project.

### Install dependencies

Run the following command to install NPM packages:

```bash
npm install
```

### Choose an issue to work on

Choose an issue from the `Issues` tab on GitHub or the project on GitHub to work on. The issues are the same whether you find them in the issues tab or the project.

### Create a feature branch

```bash
git branch myfeaturebranch
```

### Run the checks locally before creating a pull request

Run the same checks CI runs (see [Testing](#testing) below):

```bash
npx eslint .
npm run typecheck
npm test
npm run test:db && npm run test:integration
npm run build
```

### Create a pull request on GitHub

Create a pull request to merge your feature branch with main. The CI checks must pass, it will have to successfully
deploy, and it must be reviewed by the webmaster before merging.

## Testing

Tests use [Vitest](https://vitest.dev/) and live in `tests/`, split into two suites.

### Unit tests (`tests/unit/`)

Fast tests with every external dependency mocked: the database (`pg`), the NextAuth session, and the miniservices
when testing route handlers. They never touch a real database and don't need a `.env` file. The folder layout mirrors
the source tree (for example, `tests/unit/app/api/protected/tripleaders.test.ts` tests
`app/api/protected/tripleaders/route.ts`). Shared fakes live in `tests/unit/helpers.ts`.

```bash
npm test
```

### Integration tests (`tests/integration/`)

These run the real miniservices and route handlers against a throwaway Postgres database, so they catch broken SQL,
schema drift and mapping bugs that mocks can't. Only the NextAuth session is mocked, since Microsoft sign-in can't
run in a test.

Integration tests need [Docker](https://www.docker.com/products/docker-desktop/). Start the test database, then run
the suite:

```bash
npm run test:db
npm run test:integration
```

`npm run test:db` starts Postgres 14 (the production version) on port 5433 using `docker-compose.test.yml`. Before
the suite runs, it rebuilds the schema and loads the fixtures. Tests that write data reset the database first. Stop it
with `docker compose -f docker-compose.test.yml down`.

The suite is hard-coded to `localhost` in `vitest.config.mts` and refuses to run against any other host, because it
wipes every table.

- **`tests/integration/schema.sql`** is a schema-only dump of the production database (no rows).
- **`tests/integration/seed.sql`** holds the fixture rows. **Only put fake data here, never real member
  information.** Write dates relative to `CURRENT_DATE` (for example, `(CURRENT_DATE + 180)::text`) so fixtures
  never expire.

#### Updating the schema after a database change

If you change the production schema, regenerate `schema.sql` with the database credentials from `.env`. It dumps
structure only, never data:

```bash
pg_dump --schema-only --no-owner --no-privileges --schema=public \
  -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_DATABASE> > tests/integration/schema.sql
```

Then update `seed.sql` and the tests for the new columns.

### Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on every push to `main`. It runs, in order:

1. ESLint (`npx eslint .`)
2. Typecheck (`npm run typecheck`)
3. Unit tests
4. Integration tests against a Postgres container
5. `npm run build`, pointed at the seeded test database, because some pages query the database while building

CI uses placeholder credentials only, so no repository secrets are needed. A pull request must pass CI before
review.

## Deployment Information

This app is deployed on Vercel and deploys a preview whenever a pull request is created, and deploys to production once the PR is approved and completed.
