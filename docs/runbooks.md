# Runbooks

Step-by-step instructions for the tasks that come up most. Every code change goes through a branch and pull request
(see the root [README](../README.md#how-to-contribute)); run the checks listed there before opening the PR.

- [Add or change a public page](#add-or-change-a-public-page)
- [Add an API route](#add-an-api-route)
- [Add a protected page](#add-a-protected-page)
- [Give a new officer position access to a feature](#give-a-new-officer-position-access-to-a-feature)
- [Post a news article](#post-a-news-article)
- [Yearly officer turnover](#yearly-officer-turnover)
- [Update a form, calendar, or store link](#update-a-form-calendar-or-store-link)
- [Rotate a secret](#rotate-a-secret)
- [Production is broken](#production-is-broken)
- [Dues, waivers or agreements are not updating](#dues-waivers-or-agreements-are-not-updating)
- [Update dependencies](#update-dependencies)

## Add or change a public page

1. Create `app/<url>/page.tsx`. The folder name is the URL (`app/gearcloset/page.tsx` is `/gearcloset`).
2. Copy the structure of a similar page. Use HeroUI components (`@heroui/react`) and Tailwind classes; the HeroUI v3
   docs are at <https://heroui.com/react/llms-full.txt>.
3. Only add `"use client"` if the page needs browser state or effects. Client pages fetch data from `/api/...`;
   server pages may call a miniservice directly.
4. To show it in the navbar or footer, add an entry to `navItems` or `footerItems` in `config/site.ts`.
5. If it is a server page that reads the database, remember it is built at deploy time
   ([architecture.md](architecture.md#rendering-and-the-build)).

## Add an API route

Follow the four layers in [architecture.md](architecture.md#request-layers).

1. **SQL**: add a function to the right file in `miniservices/` (or a new `<thing>MiniService.ts`). Use
   parameterized queries (`$1`, never string concatenation). Map `snake_case` columns to camelCase in
   `result.rows.map(...)`.
2. **Shape**: add or reuse a class in `dtos/` for what the route returns. Add a `models/` class if you introduce a new
   table.
3. **Route**: create `app/api/<path>/route.ts` exporting `GET`/`POST`/`PUT`. Copy the auth pattern from a similar
   route:
   - public: `app/api/trips/open/route.ts`
   - signed-in + role: `app/api/protected/tripleaders/route.ts`
   - machine with API key: `app/api/automation/dues/route.ts`
4. **Protect it**: anything that returns member data goes under `app/api/protected/`, which `proxy.ts` already
   guards. For role checks, add a constant to `config/permissions.ts` instead of listing titles inline.
5. **Document it**: add the operation to `public/openapi.json`. `tests/unit/openapi.test.ts` fails if a route and the
   spec do not match. Check it renders at `https://localhost:3000/api/docs`.
6. **Test it**: unit tests for every auth and validation branch in `tests/unit/app/api/...` (mirror the source path,
   reuse `tests/unit/helpers.ts`), and an integration test for new SQL in `tests/integration/`.

## Add a protected page

1. Create the page under `app/`.
2. Add its path to the `matcher` array in `proxy.ts`. Without this, visitors are not sent to sign-in.
3. Fetch data with `protectedFetch` from `utils/protectedFetch.ts`, which handles expired sessions (401) and
   forbidden users (403). See `app/memberdirectory/page.tsx`.
4. The API route it calls must do its own role check. Hiding a page is not security.

## Give a new officer position access to a feature

1. Find the constant in `config/permissions.ts` (for example `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`).
2. Add the title **exactly** as it is stored in `officer.position` (case and spacing matter).
3. Update the unit tests that list allowed positions if needed, and open a PR.

## Post a news article

1. Add `newsposts/<SlugName>.mdx`. The file name (without `.mdx`) becomes the URL `/news/<SlugName>`.
2. Start it with frontmatter. All four fields are required:

   ```mdx
   ---
   title: "Trip Report: Red River Gorge"
   postedOn: "2026-10-05"
   summary: "One sentence shown on the news list and home page."
   author: "Jane Doe"
   ---

   Body in Markdown.
   ```

3. `postedOn` must be `YYYY-MM-DD`; posts are sorted newest first and the newest three appear on the home page.
4. Put images in `public/` and reference them as `/your-image.jpg`.

More detail: [newsposts/README.md](../newsposts/README.md).

## Yearly officer turnover

Officer data is edited by hand in the database.

1. **Officer rows**: in your database client, add an `officer` row for each new officer (`member_id`, `position`,
   `year`, `officer_data`) and delete or keep past years' rows as the club prefers. The new officer must already
   have a `member` row. `position` must use the titles in `config/constants.ts` (`LEADERSHIP_CATEGORIES`) or the
   person will not appear on `/pleadership`.
2. **Photos**: officers email a headshot. Forward each to the inbox configured for
   `scripts/fetch_poc_photos.py` with subject `POC Photo <Full Name>`, then run
   `python3 scripts/fetch_poc_photos.py --dry-run` and then without `--dry-run`. Photos land in `public/leadership/`
   as `first_last.jpg`. Track who has submitted in `PHOTO_SUBMISSIONS.md`. See [scripts/README.md](../scripts/README.md).
3. **Link the photo**: set `officer_data` to `{"ImagePath": "first_last.jpg"}` (gear officers also get
   `"GearHours"`).
4. **Permissions**: if a title changed (for example "Secretary of Sports" renamed), update `config/permissions.ts`.
5. **Deploy**: `/pleadership` and similar pages are built at deploy time, so merge the photo PR (or redeploy) after
   the rows are in.
6. **Webmaster change**: if the webmaster changes, also work through [handoff.md](handoff.md).

## Update a form, calendar, or store link

Find the file in [domain-and-links.md](systems/domain-and-links.md#links-and-embeds), replace the URL, open a PR.

## Rotate a secret

| Secret | Steps |
| --- | --- |
| `AZURE_AD_CLIENT_SECRET` | [azure-ad.md](systems/azure-ad.md#rotating-the-client-secret) |
| `DUES_API_KEY` | [power-automate.md](systems/power-automate.md#rotating-the-api-key) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`, update in Vercel (all environments), redeploy. Everyone is signed out. |
| `DB_PASSWORD` | Change it in Lightsail, then update Vercel (redeploy), every local `.env`, and the Power Automate PostgreSQL connection. |
| `GMAIL_APP_PASSWORD` | Revoke and recreate at <https://myaccount.google.com/apppasswords>; only used by the photo script. |

## Production is broken

1. Open `https://www.purdueoutingclub.com/api/healthcheck`. If it fails, the app or Vercel is down; check the latest
   deployment in Vercel.
2. If a recent merge caused it, use **Instant Rollback** in Vercel ([vercel.md](systems/vercel.md#logs-errors-and-rollbacks)),
   then revert the commit on `main`.
3. If pages that use the database fail but the health check works, check the database in Lightsail (is it running,
   is it reachable, did the password change).
4. If only sign-in fails, check the Azure client secret expiry ([azure-ad.md](systems/azure-ad.md)).
5. Read runtime logs in Vercel for the failing route.

## Dues, waivers or agreements are not updating

1. Open the flow's run history in Power Automate as `poc@purdue.edu` ([power-automate.md](systems/power-automate.md#checking-that-flows-are-healthy)).
2. For dues, match the HTTP status of the failed run against the
   [response table](systems/power-automate.md#responses).
3. For waivers and agreements, check the PostgreSQL connection is still signed in and that the columns the flow uses
   still exist.
4. Fix the member by hand in the database if needed, then resubmit the failed run.

## Update dependencies

- Dependabot opens alerts on GitHub. Update with `npm install <pkg>@<version>`, run every check from the README, and
  open a PR. Vercel's preview build is a good extra check.
- `next`, `next-auth`, `@heroui/*` and `pg` are the packages most likely to need code changes on a major upgrade.
  Read their migration guides first.
- `docs/plans/dependabot-alerts.md` shows how a large batch of alerts was handled before.
