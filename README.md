# Purdue Outing Club Website

The website for the [Purdue Outing Club](https://www.purdueoutingclub.com): public pages about trips, leadership,
gear, POCAR, and joining the club, plus a signed-in area where members see their trips and officers manage trip
leaders and member data.

It is a Next.js app deployed on Vercel, backed by a PostgreSQL database that Power Automate flows also update. If you
are new to the project, read this page, then [docs/architecture.md](docs/architecture.md), then
[docs/systems/overview.md](docs/systems/overview.md).

## Technologies

- [Next.js 16](https://nextjs.org/docs) (App Router) and [TypeScript](https://www.typescriptlang.org/)
- [HeroUI v3](https://heroui.com/react) components and [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth](https://next-auth.js.org/) with Microsoft (Azure AD) sign-in
- [PostgreSQL](https://www.postgresql.org/) through [`pg`](https://node-postgres.com/)
- [Vitest](https://vitest.dev/) for tests, [Scalar](https://scalar.com/) for API docs at `/api/docs`
- Hosting on [Vercel](https://vercel.com/), automation with Microsoft Power Automate

## Quick start

You need Node.js 22, npm, and (for integration tests) Docker.

```bash
git clone https://github.com/ColinHermack/Purdue-Outing-Club-Website.git
```

```bash
cd Purdue-Outing-Club-Website && npm install
```

Create a `.env` file at the repo root with the values from the webmaster. The keys are listed in
[docs/systems/vercel.md](docs/systems/vercel.md#environment-variables).

```bash
npm run dev
```

Open <https://localhost:3000>. The dev server uses HTTPS (accept the self-signed certificate) because Microsoft
sign-in only redirects to HTTPS URLs.

> **Your local site uses the production database.** There is no separate development database. Read freely, but be
> careful with anything that writes.

## Commands

| Command                                           | What it does                                                   |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                                     | Dev server at `https://localhost:3000`                         |
| `npm run build`                                   | Production build (needs a reachable database)                  |
| `npm run start`                                   | Run the production build                                       |
| `npx eslint .`                                    | Lint (what CI runs)                                            |
| `npm run lint`                                    | Format with Prettier and auto-fix lint issues (rewrites files) |
| `npm run typecheck`                               | TypeScript check                                               |
| `npm test`                                        | Unit tests, no database needed                                 |
| `npm run test:db` then `npm run test:integration` | Integration tests against a Postgres container                 |

Details on the tests are in [tests/README.md](tests/README.md).

## How to contribute

1. Pick an issue from the GitHub **Issues** tab or project board.
2. Create a branch: `git checkout -b my-feature`.
3. Make the change. If it touches the database, the API, or an outside system, read the matching guide in
   [docs/](docs/README.md) first.
4. Run the same checks as CI:

   ```bash
   npx eslint . && npm run typecheck && npm test
   ```

   ```bash
   npm run test:db && npm run test:integration && npm run build
   ```

5. Push and open a pull request into `main`. CI runs, and Vercel builds a preview and comments its link on the PR.
6. The webmaster reviews. Once CI passes and the PR is approved, merge it; Vercel deploys to production
   automatically.

## Documentation map

| Where                                        | What                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [docs/README.md](docs/README.md)             | Index of all guides                                                                         |
| [docs/architecture.md](docs/architecture.md) | How the code is organized, request flow, sign-in and permissions                            |
| [docs/systems/](docs/systems/overview.md)    | Vercel, database, Power Automate, Azure AD, domain and outside links                        |
| [docs/runbooks.md](docs/runbooks.md)         | Step-by-step tasks (new page, new API route, news post, officer turnover, secrets, outages) |
| [docs/handoff.md](docs/handoff.md)           | Checklist for handing the site to a new webmaster                                           |
| [docs/plans/](docs/plans/)                   | Historical design plans (not kept current)                                                  |
| `README.md` in each folder                   | What that folder contains and its conventions                                               |
| [CLAUDE.md](CLAUDE.md)                       | Short project summary for AI coding assistants                                              |

## Contact

The webmaster owns this repository (see [CODEOWNERS](CODEOWNERS)) and reviews every pull request.
