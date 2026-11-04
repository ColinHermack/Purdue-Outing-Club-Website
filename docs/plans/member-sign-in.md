# Member sign-in rollout (trip leaders and officers)

## Context

Auth pages are soft launched (`/dashboard`, `/memberdirectory`, `/tripleadersdashboard`, `/memberexport`) but nothing on the public site links to them. Design in `docs/designs/member-sign-in-design.html` adds a footer sign-in link, a signed-in account menu in the navbar (desktop and mobile), and a redesigned `/dashboard`. Right now the NextAuth `signIn` callback lets in any row in `member`. For this rollout only trip leaders and officers may sign in. Later rollout to all members should be a one-line change.

Decisions from Q&A:
- Member Directory stays trip-leader-only (route unchanged). Menu mirrors route.
- Dashboard readiness rows, banner and driver card are informational only. No action links or buttons.
- Old JWT sessions from plain members are revoked by also gating `/api/protected/user*`.

## Design summary

- Footer (signed out): "Trip Leader Sign In" link next to the copyright line, to `/auth/signin`. Hidden when signed in.
- Navbar signed out: unchanged (Join button).
- Navbar signed in, desktop: Join button replaced by account button (amber initials avatar + first name). Opens menu: name and email, My Dashboard, "Club tools" section (role filtered), Sign out.
- Navbar signed in, mobile: header shows avatar link to dashboard; menu shows user row, nav links, divider, My Dashboard, tools, Sign out. No Join.
- Tools by role: Trip Leader Dashboard (officer in `GET_TRIP_LEADERS_AUTHORIZED_POSITIONS`), Member Directory (trip leader), Member Export (officer in `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`).
- `/dashboard`: header (name, email, school year), optional orange "You can't sign up for trips yet" banner, My trips card (newest first, paginated), side column cards: Trip readiness (dues, waiver, policy), First aid, Driver certification, Emergency contact. Sign Out moves to the account menu.

## Plan

### 1. Access helper (single source of truth)

New `utils/memberAccess.ts` (server only, imports miniservices):
`getMemberAccess(email): Promise<{ isMember, isOfficer, isTripLeader, tools }>`.
- `getMemberByEmail` (exists) gives member id.
- `getOfficerDataByEmail` (exists) gives positions, checked against `config/permissions.ts` arrays.
- `getTripLeader(memberId)` (exists in `miniservices/tripLeaderMiniService.ts`) gives trip leader status. No new SQL needed.
- `canSignIn(access) = isMember && (isOfficer || isTripLeader)`. This is the one line to widen later.
- `tools`: list of ids (`tripLeaderDashboard`, `memberDirectory`, `memberExport`) computed from permissions. Labels and hrefs live in `config/site.ts` (`accountTools`).

### 2. Gate sign-in and old sessions

- `app/api/auth/[...nextauth]/options.ts`: `signIn` callback uses `getMemberAccess` + `canSignIn` instead of `verifyMembershipByEmail`. Still returns false on throw.
- `app/api/protected/user/route.ts` and `user/trips/route.ts`: after the 401 check, return 403 when `!canSignIn(access)`.
- `app/auth/signin/page.tsx`: update `AccessDenied` copy: sign-in is currently limited to trip leaders and officers; others see "how to join" link and webmaster contact.
- `app/dashboard/page.tsx`: handle `forbidden` result from `protectedFetch` with a `PageMessage` explaining the limit, plus link to `/auth/signout`.

### 3. Access endpoint for the menu

New `app/api/protected/user/access/route.ts` (GET): 401 without session, 403 if `!canSignIn`, else `{ name, email, tools }`. Route stays under `/api/protected` so `proxy.ts` matcher already covers it. Add to `public/openapi.json` (also add 403 to `/user` and `/user/trips`).

### 4. Navbar account menu

- `components/navbar.tsx`: `useSession()` (`AuthProvider` already wraps the app). When `status === "authenticated"`, `protectedFetch("/api/protected/user/access")` once; on forbidden or error, fall back to the signed-out view (Join). Do not redirect on failure.
- Extract `components/AccountMenu.tsx` (desktop dropdown) and a mobile section component. Use HeroUI v3 Dropdown per https://heroui.com/react/llms-full.txt (verify exact API during implementation). Initials helper in `utils/` (first letters of first and last name).
- Mobile: keep existing animated dropdown menu; swap Join for the signed-in section; header shows avatar link to `/dashboard`.
- Sign out links to `/auth/signout` (existing flow).
- Avoid flash: render signed-out view until access resolves.

### 5. Footer sign-in link

`components/footer.tsx` is a server component. Add small client component `components/SignInLink.tsx` using `useSession`, rendering "Trip Leader Sign In" (`/auth/signin`) only when unauthenticated, placed beside the copyright line. Also check the repeated footer link groups in the design against `siteConfig.sitemapLinks` (design shows same groups, expected no change).

### 6. Dashboard redesign

Rewrite `app/dashboard/page.tsx` with HeroUI Cards and theme tokens (no hardcoded hex, so dark mode keeps working). Data from existing `/api/protected/user` (`MemberDTO`) and `/api/protected/user/trips`.
- New `utils/memberStatus.ts` with pure functions: `duesStatus(duesData)` (valid, expired, none; compare `Expires` date string to today), `driverStatus`, `firstAidStatus`, `canSignUp(member)` (dues valid and policy signed and waiver signed), `needsActionMessage(member)` building the banner sentence from the missing items.
- Trips: sort by `startDate` descending client-side, format `Mon D, YYYY` or `Mon D to D, YYYY` ranges, page size 5, link rows to `/trips/[id]`.
- Pagination: move `buildPageItems` from `app/memberdirectory/page.tsx` to `utils/pagination.ts`, reuse in both pages with HeroUI `Pagination`.
- Banner: orange status box with no button. Readiness rows: ok, needs attention, optional icon states with value text only. Driver card: Certified / Not certified badge plus detail text, no button. Missing first aid or emergency contact shows an empty-state line.
- Keep loading and failure states already present (`userFailed`, `tripsFailed`).

### 7. Tests (per CLAUDE.md conventions)

Unit:
- `tests/unit/utils/memberAccess.test.ts`: officer only, trip leader only, both, neither, unknown email, tool lists per position.
- `tests/unit/app/api/auth.test.ts`: update; plain member now rejected, officer and trip leader accepted, throw rejects.
- `tests/unit/app/api/protected/user.test.ts`: add 403 for non leader on `/user` and `/user/trips`; new `user/access` route tests (401, 403, tools).
- `tests/unit/utils/memberStatus.test.ts`, pagination util test.
- `tests/unit/openapi.test.ts` passes once spec updated.
Integration: no new miniservice SQL, so none required. Optionally extend `tests/integration/api/member.test.ts` with the access route against seed data (member, officer, trip leader, plain member).

## Critical files

`utils/memberAccess.ts` (new), `app/api/auth/[...nextauth]/options.ts`, `app/api/protected/user/route.ts`, `app/api/protected/user/trips/route.ts`, `app/api/protected/user/access/route.ts` (new), `components/navbar.tsx`, `components/AccountMenu.tsx` (new), `components/SignInLink.tsx` (new), `components/footer.tsx`, `app/dashboard/page.tsx`, `app/auth/signin/page.tsx`, `config/site.ts`, `utils/memberStatus.ts` and `utils/pagination.ts` (new), `public/openapi.json`.

## Verification

1. `npm test`, `npm run typecheck`, `npx eslint .`, `npm run build` (needs DB; or rely on CI).
2. `npm run dev` (HTTPS). Signed out: footer shows "Trip Leader Sign In", navbar shows Join. Resize to mobile and check both.
3. Sign in as a plain member: Microsoft succeeds but the app shows the access-denied message. Seed an old-session case by hitting `/api/protected/user` with a plain member cookie: expect 403.
4. Sign in as a trip leader: avatar menu shows My Dashboard and Member Directory only. Sign in as webmaster: all three tools. Officer who is not a trip leader sees no Directory.
5. `/dashboard`: compare against the design for both "Ready for trips" and "Needs attention" members (change dues date or policy flag in the local DB), pagination, dark mode, 390px width.
6. Sign out from the menu clears session and returns to the public view.
