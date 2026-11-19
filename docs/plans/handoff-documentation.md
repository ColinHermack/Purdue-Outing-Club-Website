# Handoff documentation for the Purdue Outing Club website

## Context

Repo ownership is moving from the current webmaster (sole maintainer since day one) to a new maintainer with little familiarity. Today the knowledge lives in the maintainer's head, `CLAUDE.md`, a short root `README.md`, and `docs/plans/` (design history, not a guide). The site also depends on systems that are invisible from the code: Vercel, the `poc@purdue.edu` Microsoft account (Azure AD app, Power Automate flows), AWS Lightsail Postgres, and a Squarespace domain. Goal: a new maintainer can set up, change, deploy, debug, and take over every account using only the repo.

Step 0 of implementation: copy this plan to `docs/plans/handoff-documentation.md` (user rule: plans live in the repo). Work on branch `docs/handoff`.

## Facts gathered (from code, Vercel connector, and user Q&A)

- **Vercel**: team `purdue-outing-clubs-projects`, project `outing-club-website-v2`, Node 22, framework nextjs. Sole team member and OWNER: "Purdue Outing Club" (club Gmail account). Domains: `www.purdueoutingclub.com` (primary), apex `purdueoutingclub.com` 308 redirects to www, plus `*.vercel.app`. Vercel Authentication (SSO protection) on for previews and prod deployment URLs. Analytics + Speed Insights in `app/layout.tsx`.
- **Vercel env vars**: `AZURE_AD_CLIENT_ID/SECRET/TENANT_ID`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DB_*` on all three targets; `DUES_API_KEY` on production + preview only. `AZURE_AD_CLIENT_SECRET` comment says to rotate in Azure Portal on expiry. Vercel flags `NEXTAUTH_SECRET` and `DB_PASSWORD` as `readable-secret` (not marked Sensitive).
- **Domain**: registered at Squarespace.
- **Database**: Postgres 14 on AWS Lightsail, AWS account tied to `poc@purdue.edu`. Tables `member`, `officer`, `trip`, `trip_roster`, `trip_leader`, `gear`, `gear_out`; views and triggers in `tests/integration/schema.sql`.
- **Who writes what**:
  - `member.dues_data`, new member rows: web app `/api/automation/dues`, called by the Dues flow.
  - `member.waiver_agreement`: Power Automate PostgreSQL connector (DocuSign flow).
  - `member.name`, `member.policy_agreement`: Power Automate PostgreSQL connector (Forms flow).
  - `trip`, `trip_roster`: other Power Automate flows, **out of scope for now** (doc gets a stub section).
  - `trip_leader`: web app (`/tripleadersdashboard` via `/api/protected/tripleaders`).
  - `officer`: edited by hand.
  - `gear`, `gear_out`: unused.
- **Power Automate** (all flows owned by `poc@purdue.edu`):
  1. *Dues - TooCool*: TooCool receipt email arrives at poc@purdue.edu, flow POSTs `{email, receipt(base64 PDF)}` with `Authorization: Bearer DUES_API_KEY` to `/api/automation/dues` (`app/api/automation/dues/route.ts`, `utils/duesReceipt.ts`).
  2. *DocuSign - Club Sports Waiver*: signed Purdue club sports waiver email from DocuSign, sets waiver flag true.
  3. *Forms - Info and Policy Agreement*: updates name and `policy_agreement`.
- **Azure AD app registration**: under `poc@purdue.edu`. Redirect URI is HTTPS (dev uses `--experimental-https`).
- **GitHub**: repo `ColinHermack/Purdue-Outing-Club-Website` (personal account), `CODEOWNERS` = `@ColinHermack`, CI in `.github/workflows/ci.yml`.
- **Other services** linked from the site (no API calls): Google Calendar embed (`app/calendar`), MS Forms, Google Forms, TooCool store, DocuSign PowerForm, SambaSafety, Slack invite, giving pages. URLs live mostly in `config/constants.ts` and `config/site.ts`.
- **Scripts**: `scripts/fetch_poc_photos.py` (Gmail IMAP officer headshots into `public/leadership/`, needs `GMAIL_USER`/`GMAIL_APP_PASSWORD`), `scripts/check-member-directory-sql.js` (checks directory SQL against `all_members` view). `PHOTO_SUBMISSIONS.md` tracks headshots.
- **Comment coverage**: miniservices, `utils/`, `proxy.ts`, API routes are decent. Zero or header-only comments in most pages (`app/page.tsx`, `app/layout.tsx`, `app/providers.tsx`, `app/news/*`, `app/climbingteam`, `app/drivers`, `app/trips/[id]/tripDifficultyIcon.tsx`), `config/permissions.ts`, `config/constants.ts`, `config/site.ts`, `components/*`, and the 710-line `app/tripleadersdashboard/page.tsx`.

## Deliverables

All prose: plain, task-oriented, **no em dashes**, relative links. Avoid duplicating content: each fact has one home, other places link to it.

### 1. Root `README.md` (rewrite)
What the site is, who uses it, tech stack, quick start (clone, `.env` from webmaster, `npm install`, `npm run dev` at `https://localhost:3000`), contributing flow (branch, checks, PR, review, Vercel preview), and a "Documentation map" linking everything below. Move the long Testing section to `tests/README.md` and link it.

### 2. `docs/` guides (new, beside existing `docs/plans/`)
- `docs/README.md`: index of guides; explains `docs/plans/` is design history, not current truth.
- `docs/architecture.md`: four request layers (models, miniservices, DTOs, routes) with one traced example (trips page to `tripMiniService`); folder map; public vs protected pages; auth flow (Azure AD, `signIn` membership check, JWT, `proxy.ts` matcher, `config/permissions.ts` roles, Azure signout); three API auth types (public, session + role, API key); pages that query the DB at build time. Mermaid sequence diagram for sign-in.
- `docs/systems/overview.md`: Mermaid diagram of every system and arrows (GitHub, CI, Vercel, Lightsail, Azure AD, Power Automate, TooCool, DocuSign, MS Forms, Squarespace DNS) plus a table: system, what it does for the site, owning account, where its config lives.
- `docs/systems/vercel.md`: team/project names, domains and redirect, preview vs production flow, Vercel Authentication on previews, env var table (name, targets, purpose, where to get value, rotation), viewing build and runtime logs, instant rollback, Analytics/Speed Insights.
- `docs/systems/database.md`: Lightsail host and ownership, connecting with psql/pgAdmin (SSL), table-by-table reference with JSON column shapes (`dues_data`, `driver_data`, `first_aid_data`, `officer_data`...), views, triggers, **writer matrix** (table/column to web app / flow / hand / unused), refreshing `schema.sql`, backups (Lightsail snapshots; TODO confirm schedule).
- `docs/systems/power-automate.md`: one section per flow: trigger, steps, data written, failure behavior, how to test. Dues flow includes request/response contract and status codes from the route. Warning box: renaming `member` columns breaks flows silently. Stub section for trip/trip_roster flows ("not yet documented").
- `docs/systems/azure-ad.md`: app registration in `poc@purdue.edu`, redirect URIs (localhost + prod), client secret expiry and rotation steps, tenant, what happens when the secret expires (all sign-ins fail).
- `docs/systems/domain-and-links.md`: Squarespace registration and DNS records pointing to Vercel, renewal; list of external links/embeds and the file each lives in so non-code updates (new form link, calendar) are easy.
- `docs/runbooks.md`: step lists for common tasks: add a public page (and `config/site.ts` nav entry), add an API route (layers, `permissions.ts` constant, `public/openapi.json`, unit + integration tests), add a news post (MDX frontmatter fields from `app/news/utils.ts`), yearly officer turnover (officer rows by hand, photos via `fetch_poc_photos.py`, `PHOTO_SUBMISSIONS.md`, permission position titles), rotate each secret, debug a production error, roll back a bad deploy, dependency/Dependabot updates.
- `docs/handoff.md`: ownership transfer checklist with owner/status columns: GitHub repo transfer (personal account, consider an org) and `CODEOWNERS`; Vercel team owner; `poc@purdue.edu` credentials (gates Azure AD, Power Automate, Lightsail); club Gmail; Squarespace; `.env` distribution; `GMAIL_*` script creds; update "webmaster" references in `CLAUDE.md`/README. Plus "known risks" found while documenting: `NEXTAUTH_SECRET` and `DB_PASSWORD` not marked Sensitive in Vercel; Azure secret expiry date; single-person ownership of every account.

### 3. Per-directory READMEs (short, 20 to 60 lines each, GitHub shows them when browsing)
`app/README.md` (route map: page, public/protected, data source), `app/api/README.md` (endpoint table: method, path, auth type, miniservice, permission constant; link to `/api/docs` Scalar), `miniservices/README.md` (pool per service, `"use server"`, snake to camel mapping, function index), `dtos/README.md` and `models/README.md` (difference between the two, one line per class), `config/README.md`, `components/README.md`, `utils/README.md`, `newsposts/README.md` (how to write a post), `scripts/README.md`, `tests/README.md` (moved testing section), `public/README.md` (image folders, `docs/` PDFs, `openapi.json`).

### 4. Code comments
Standard, applied to every non-test source file:
- **File header** JSDoc (existing `@author` style): purpose, who calls it, external systems touched.
- **Exported functions/components**: JSDoc with params, return, thrown errors; for miniservices also the tables/views queried.
- **Why-comments only** inside bodies: non-obvious logic, magic values, workarounds (e.g. explain `dynamic = "force-dynamic"` once properly instead of "Stops NextJS from overoptimizing").
- **Cross-system warnings** where code meets something outside the repo: member columns written by flows (`memberMiniService.ts`, `models/member.ts`), the dues route contract the flow depends on, `proxy.ts` matcher must exclude `/api/automation`, `config/permissions.ts` titles must match `officer.position` strings exactly, `NEXTAUTH_URL`/redirect URI coupling in `options.ts`, build-time DB pages.
- Priority order: `config/` files, `app/layout.tsx`/`providers.tsx`, `app/tripleadersdashboard/page.tsx`, `app/news/*`, zero-comment pages, `components/*`, then touch-ups to miniservices/routes/models/DTOs.
- Comments only, no behavior changes. Sync `CLAUDE.md` with a pointer to `docs/`.

## Open items to confirm with user during implementation (left as visible `TODO(handoff):` markers if unanswered)

- Forms policy flow: updates existing rows only, or inserts new members? Match key (email?).
- DocuSign flow: confirm column is `waiver_agreement` (user called it "dues_waiver").
- What each flow does on failure (email alert, retry, nothing) and the Dues flow's prod URL.
- Lightsail backup/snapshot schedule; Azure client secret expiry date.

## Sequencing

One branch, one PR, commits per deliverable (README + docs, per-directory READMEs, code comments) so review can go commit by commit.

## Verification

- `npx eslint .`, `npm run typecheck`, `npm test` pass (comments only, Prettier formatting).
- `git diff --stat` shows only `.md` files and comment lines; `git diff -U0 -- '*.ts' '*.tsx' | grep '^[+-]' | grep -vE '^\S\s*(//|/\*|\*|$)'` returns nothing beyond file markers.
- `grep -rn '—' --include=*.md --include=*.ts --include=*.tsx` on changed files returns nothing.
- Every relative link in new Markdown resolves (small `node -e` check over `]\(` targets, not committed).
- Mermaid diagrams render in the PR's GitHub file view.
- User reads `docs/systems/power-automate.md` and `docs/handoff.md` for accuracy, since those come from Q&A, not code.
