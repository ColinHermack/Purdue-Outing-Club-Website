# Protected Pages Usability Fixes

## Context

The protected pages (`/dashboard`, `/tripleadersdashboard`, `/memberdirectory`, `/memberexport`) and the `/api/protected/*`
routes block unauthorized access, but the experience around that is broken:

1. **Sign-in reload loop.** For `OAuthSignin`, `OAuthCallback` and `Callback` errors, next-auth 4.24 redirects to
   `/auth/signin?callbackUrl=...&error=X` (`node_modules/next-auth/core/index.js:209`). `app/auth/signin/page.tsx` ignores
   `error` and calls `signIn()` again, so the user loops through Microsoft forever.
2. **Non-members get a 404.** `signIn` callback returning false yields `AccessDenied`, which goes to `pages.error`
   (`/auth/error`). That page does not exist.
3. **Unauthorized users are bounced to `/`** with no message (`tripleadersdashboard`, `memberdirectory` client
   `redirect("/")`; `memberexport` server `redirect("/")`).
4. **401/403 are swapped** in every protected route except `/membership` (403 = no session, 401 = not permitted).
5. **Expired session breaks API calls.** `proxy.ts` redirects unauthenticated `/api/protected/*` fetches to the sign-in
   HTML page, so `response.json()` throws and the page hangs or crashes. Also the inner redirect branch in `proxy.ts` is
   dead code (`withAuth` already redirects when `authorized` is false) and `withAuth` uses its default `/api/auth/signin`,
   costing an extra hop.
6. **Missing error states.** `/dashboard` shows "Loading..." forever if the user fetch fails, and "No trips" when the trips
   fetch fails. `/tripleadersdashboard` stores error responses as data (`.filter` crash on the members fetch), and save/add
   failures are silent (the edit modal closes before the PUT resolves).

Out of scope: nav links to these pages (soft launch), `app/error.tsx` styling.

## Changes

### 1. Shared message component: `components/PageMessage.tsx` (new)

Small server-safe component: `title`, `children` (body text), optional `action` (ReactNode). Styled like
`app/not-found.tsx` (amber `h1`, centered column, `buttonVariants` links). Used for auth errors, "not authorized", and
"couldn't load" states, so all pages look the same.

### 2. Sign-in errors: `app/auth/signin/page.tsx` + `options.ts`

- `app/api/auth/[...nextauth]/options.ts`: set `pages.error: "/auth/signin"` so every next-auth error lands on one page
  that already has `callbackUrl`. No `/auth/error` page needed.
- Sign-in page: if `searchParams.get("error")` is set, do NOT call `signIn()`. Render `PageMessage` with a message by code:
  - `AccessDenied`: "Your Microsoft account isn't on the club's member list." Point to `/join`, mention signing in with
    the Purdue account you joined with, contact webmaster.
  - `Configuration`: "Sign-in is misconfigured on our end. Contact the webmaster."
  - anything else: "Microsoft sign-in failed."
  - Action: "Try again" button calling `signIn("azure-ad", { callbackUrl }, { prompt: "select_account" })` (lets a user
    who picked a personal account switch), plus a "Return home" link.
- No `error` param: unchanged (auto `signIn`).

### 3. Swap 401/403 in protected routes

401 = no session, 403 = signed in but not permitted. Files: `app/api/protected/{user,user/trips,memberdirectory,members,tripleaders,memberexport}/route.ts`.
Keep the existing `404` branches (signed-in user with no member row). Update to match:

- `tests/unit/app/api/protected/*.test.ts` expectations
- `tests/integration/api/{tripleaders,member}.test.ts` expectations
- `public/openapi.json` 401/403 descriptions for each `/api/protected/*` operation

### 4. `proxy.ts`

- `authorized: ({ token, req }) => !!token || req.nextUrl.pathname.startsWith("/api/")` so API paths reach the inner
  function, which returns `NextResponse.json({ error: "Unauthorized" }, { status: 401 })` when `!token`. Pages still get
  the `withAuth` redirect.
- Pass `pages: { signIn: "/auth/signin" }` to `withAuth`.
- Delete the dead redirect branch and the commented-out example.

### 5. Client fetch helper: `utils/protectedFetch.ts` (new)

```ts
export type ProtectedResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "error" };

export async function protectedFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<ProtectedResult<T>>;
```

- 401: `window.location.assign("/auth/signin?callbackUrl=" + encodeURIComponent(location.pathname))`, returns
  `{ status: "error" }` (page is navigating away anyway).
- 403: `{ status: "forbidden" }`. Other non-OK or thrown/JSON error: `{ status: "error" }`. OK: parsed JSON.

Unit test `tests/unit/utils/protectedFetch.test.ts`: ok, 401 redirects, 403, 500, network throw (mock `fetch` and
`window.location.assign` via `vi.stubGlobal`).

### 6. Pages

Pattern for each client page: a `status` state (`"loading" | "ok" | "forbidden" | "error"`), set from `protectedFetch`
results. `forbidden` renders `PageMessage` "You don't have access to this page" naming who does; `error` renders
`PageMessage` "Couldn't load ..." with a "Try again" button (`location.reload()`). Remove the `redirect` imports.

- `app/tripleadersdashboard/page.tsx`: both GETs via `protectedFetch`; forbidden text lists
  `GET_TRIP_LEADERS_AUTHORIZED_POSITIONS` (import from `config/permissions.ts`; plain constants, client-safe).
  `handleSave`/`handleCreate` use `protectedFetch`; on failure show an inline error line in the modal footer and keep the
  modal open. Move `setIsModalOpen(false)` into `handleSave` on success. Reset `isCreating` in all paths.
- `app/memberdirectory/page.tsx`: GET via `protectedFetch`; forbidden text "limited to trip leaders".
- `app/dashboard/page.tsx`: both GETs via `protectedFetch`; user failure shows the error message instead of "Loading...";
  trips failure shows "Couldn't load your trips." inside the card instead of "No trips to display."
- `app/memberexport/page.tsx` (server): replace `redirect("/")` with `return <PageMessage ...>` listing
  `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`.

## Verification

- `npx eslint .`, `npm run typecheck`, `npm test`.
- `npm run test:db && npm run test:integration` (swapped status codes).
- Manual on `npm run dev` (https://localhost:3000):
  - `/auth/signin?error=OAuthCallback`: message shown, no loop; "Try again" opens Microsoft account picker.
  - `/auth/signin?error=AccessDenied`: non-member message.
  - Sign in as a member who is not an officer / trip leader: `/tripleadersdashboard`, `/memberdirectory`,
    `/memberexport` show "no access" message, not the homepage.
  - Delete the session cookie with `/dashboard` open, then trigger a fetch (e.g. save on trip leader dashboard):
    redirected to sign-in, returns to the page after.
  - `curl -k https://localhost:3000/api/protected/user` without cookie: `401` JSON, not a redirect.
