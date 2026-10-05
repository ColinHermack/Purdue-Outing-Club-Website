# Member CSV Export Page

## Context

The Gear Lord needs a CSV of every row in `member` (name, email). Add a gated page `/memberexport` with one
download button. Only officers whose position is "Gear Lord", "Secretary of Operations", or "Webmaster" may use it.

Note on sign-in: sign-in itself stays site-wide (any member may sign in, per `signIn` in
`app/api/auth/[...nextauth]/options.ts`). The position restriction applies to the page and the CSV endpoint, same as
`/tripleadersdashboard`. Signed-out users are bounced to `/auth/signin?callbackUrl=/memberexport` by `proxy.ts`.

## Step 0

Copy this plan to `docs/plans/member-export.md` (user rule: plans live in the repo).

## Changes

### 1. `config/permissions.ts`

```ts
export const EXPORT_MEMBERS_AUTHORIZED_POSITIONS = [
  "Gear Lord",
  "Secretary of Operations",
  "Webmaster",
];
```

### 2. `proxy.ts`

Add `"/memberexport"` to `matcher`. (`/api/protected/:path*` already covers the endpoint.)

### 3. `app/api/protected/memberexport/route.ts` (new)

`GET`, copying the auth shape of `app/api/protected/tripleaders/route.ts` GET exactly:
- no session / no email: 403
- `getOfficerDataByEmail()` null or no position in `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`: 401
- otherwise `getMembers()` (existing, `miniservices/memberMiniService.ts`), sort by name (`localeCompare`), build CSV
  `Name,Email` + one row per member, return with
  `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="members-YYYY-MM-DD.csv"`.
- `try/catch` returning 500.

CSV cell escaping (small local function in the route): null becomes empty; prefix `'` if the value starts with
`= + - @` tab or CR (formula injection, names are member-entered and the file gets opened in Excel); then wrap in
quotes and double inner quotes. Rows joined with `\r\n`.

No new SQL, no new DTO: reuses `getMembers()` and only serializes `name`/`email`.

### 4. `app/memberexport/page.tsx` (new, server component)

- `getServerSession(authOptions)`, `getOfficerDataByEmail(email)`, same position check; `redirect("/")` if not
  allowed (matches where the client dashboards send unauthorized users).
- Renders `<title>`, heading in the existing style (`text-5xl text-amber-400 font-bold`), short line of text, and
  `<Link href="/api/protected/memberexport" className={buttonVariants()}>Download member CSV</Link>` (pattern from
  `app/drivers/page.tsx`). A plain link to an `attachment` response downloads the file; no client JS needed.
- Server component, so no extra probe endpoint. `getServerSession` reads cookies, so the page is dynamic and does
  not query the DB at build time.
- No navbar link, consistent with `/dashboard`, `/tripleadersdashboard`, `/memberdirectory`.

### 5. Tests: `tests/unit/app/api/protected/memberexport.test.ts` (new)

Mirror `tripleaders.test.ts` (mock `next-auth/next`, `memberMiniService`, `officerMiniService`; use `session()`):
- 403 no session, 403 no email, 401 not an officer, 401 wrong position (e.g. "President")
- 200 for each of the three positions (`it.each`)
- body: header row, sorted rows, a name with a comma and a quote escaped, a name starting with `=` prefixed, headers
  `text/csv` + `attachment`
- 500 when `getMembers` throws

No integration test: no new SQL (`getMembers` already covered).

### 6. Docs

Deferred: `docs/architecture.md` and the updated `CLAUDE.md` live on `docs/handoff`, not `main`. Apply these
after that branch merges, to avoid conflicts.


- `docs/architecture.md`: add `/memberexport` to the matcher list (~line 121) and the client/server page list
  (~line 70, server pages), add the endpoint to the role-check list (~line 125).
- `CLAUDE.md`: add `/memberexport` to the `proxy.ts` matcher sentence.

## Verification

1. `npx eslint .`, `npx tsc --noEmit`, `npm test`.
2. `npm run dev`, open `https://localhost:3000/memberexport` signed out: lands on sign-in.
3. Signed in as a member without an allowed position: redirected to `/`; hitting `/api/protected/memberexport`
   directly returns 401.
4. Signed in as Webmaster: page shows button, click downloads CSV that opens cleanly in Excel/Numbers with all
   members.
