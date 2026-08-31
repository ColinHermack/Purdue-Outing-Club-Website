# Member Directory Page

## Context

Trip leaders currently have no way to look up the club roster. When planning a trip they need to answer practical questions fast: is this person a paid-up member, do they have current first aid, can they drive, how many seats does their car have, can it tow the trailer. Today that data lives only in the `member` table's JSON columns and is not exposed anywhere in the app — `/api/protected/members` returns just `{id, name, email}` and is gated to officers.

This adds `/memberdirectory`: an authenticated, trip-leader-only page listing every member with the trip-planning-relevant fields, searchable, with a toggle between all members and active members only.

Decisions confirmed with the user:

- **Access**: any member with a row in `trip_leader`. Officers who are not trip leaders get 401.
- **"Active"**: the full rule already encoded in the `all_members` DB view — dues not expired AND `waiver_agreement` AND `policy_agreement` AND `holds IS NULL`.
- **Certifications**: expiry dates only. The `Verified` flags in `first_aid_data` / `driver_data` do not gate status (matches the existing `active_members` / `all_members` views).
- **Route**: `/memberdirectory`, no navbar link — consistent with `/dashboard` and `/tripleadersdashboard`, neither of which appears in `config/site.ts`.
- **Pagination**: on by default. 1596 rows is too many to render at once.

## Schema facts (verified against the live DB)

All relevant data is JSON columns on `member`. There are no dues / certification / car tables. Key shapes:

| column | keys |
| --- | --- |
| `dues_data` | `Type`, `Expires` (date string), `Paid` |
| `first_aid_data` | `Type`, `Expires`, `Verified` |
| `car_data` | `Model`, `Nickname`, `Color`, `Capacity` (string), `Hitch` (boolean) |
| `driver_data` | `License`, `State`, `Expires`, `Verified` |

Note `member` has 1596 rows, of which only 52 currently pass the dues-not-expired check. The active-only view will look near-empty out of season — that is correct, not a bug.

The existing `all_members` and `active_members` DB views already cast `(dues_data ->> 'Expires')::date` over every row without a WHERE guard, which proves the stored date strings all parse. No defensive parsing needed.

## Changes

### 1. `dtos/memberDirectoryEntryDto.ts` (new)

Flat DTO, no nesting. Deliberately omits `emergency_data` and `medical_data` — this endpoint must never serialize them.

```ts
export default class MemberDirectoryEntryDTO {
  id?: number;
  name?: string;
  pronouns?: string;
  email?: string;
  phone?: string | null;
  isActive?: boolean;
  policyAgreement?: boolean;
  waiverAgreement?: boolean;
  duesStatus?: "paid" | "expired" | "none";
  firstAidType?: string | null; // null = no active certification
  carCapacity?: string | null;
  carHitch?: boolean;
  driverCertified?: boolean;
}
```

`firstAidType` collapses "expired" into "none" per the requirement — the page never distinguishes them.

### 2. `miniservices/memberMiniService.ts` — add `getMemberDirectory()`

One query, all status computed in SQL so the date math runs against the DB's `CURRENT_DATE` (no client-timezone drift) and reuses the exact expressions the existing views use. Returns every member with an `is_active` flag; the page filters and paginates client-side, matching how `app/tripleadersdashboard/page.tsx` already filters its list.

```sql
SELECT
  member_id,
  name,
  pronouns,
  email,
  COALESCE(
    (dues_data ->> 'Expires')::date > CURRENT_DATE
      AND waiver_agreement = true
      AND policy_agreement = true
      AND holds IS NULL,
    false
  ) AS is_active,
  CASE
    WHEN dues_data IS NULL THEN 'none'
    WHEN (dues_data ->> 'Expires')::date > CURRENT_DATE THEN 'paid'
    ELSE 'expired'
  END AS dues_status,
  CASE
    WHEN (first_aid_data ->> 'Expires')::date > CURRENT_DATE
      THEN first_aid_data ->> 'Type'
  END AS first_aid_type,
  car_data ->> 'Capacity' AS car_capacity,
  (car_data ->> 'Hitch')::boolean AS car_hitch,
  COALESCE((driver_data ->> 'Expires')::date > CURRENT_DATE, false) AS driver_certified
FROM member
ORDER BY name;
```

The `COALESCE(..., false)` on `is_active` and `driver_certified` matters: a NULL `dues_data`/`driver_data` makes the comparison NULL, not false, and NULL would serialize as `null` instead of `false`.

Add a local `MemberDirectoryRow` interface next to the existing `MemberRow`, and map snake_case → camelCase in `result.rows.map(...)` as the file already does in `mapMemberRow`. Reuse the module's existing `pool`.

### 3. `app/api/protected/memberdirectory/route.ts` (new)

Follows the canonical guard from `app/api/protected/user/trips/route.ts` plus a trip-leader check:

1. `getServerSession(authOptions)`; missing session or non-string email → `403 Unauthorized` (the repo's inverted convention — keep it consistent).
2. `getMemberByEmail(session.user.email)` from `@/miniservices/memberMiniService`; null or no `id` → 404.
3. `getTripLeader(member.id)` from `@/miniservices/tripLeaderMiniService` — already exists and returns `TripLeaderDTO | null`. Null → `401 Forbidden`. Reused as-is rather than adding a `verifyMemberIsTripLeader` helper; it pulls a few extra joined columns that get discarded, which is not worth new code.
4. `getMemberDirectory()` → `new Response(JSON.stringify(entries), { status: 200 })`.

No constant is added to `config/permissions.ts`. That file holds officer-position arrays; this gate is table membership, not a position list, so there is nothing to put there.

### 4. `proxy.ts` — extend the matcher

```ts
matcher: ["/api/protected/:path*", "/dashboard", "/tripleadersdashboard", "/memberdirectory"],
```

Literal strings, not prefixes — matches the existing entries.

### 5. `app/memberdirectory/page.tsx` (new)

Client component modeled on `app/tripleadersdashboard/page.tsx`, which is the reference for every idiom below.

- `useState<MemberDirectoryEntryDTO[] | null>(null)` — `null` means "not loaded", so `{members === null ? <Spinner ... /> : <Table>...}` gives the same loading behavior added in commit `d0a24fa`.
- Single `useEffect` fetching `/api/protected/memberdirectory`; on `401`/`403` call `redirect("/")` from `next/navigation`, same as the trip leaders dashboard. `proxy.ts` handles the no-session case; the API's 401 is what bounces a signed-in non-trip-leader.
- Inline `<title>Member Directory - Purdue Outing Club</title>` (client component, so no `metadata` export).
- Search: `TextField` + `Input` driving a `searchTerm` string, filtered inline over name and email. **Lowercase `searchTerm` before comparing** — `tripleadersdashboard/page.tsx` omits this and its search silently fails on any capital letter; do not copy that bug.
- Active-only filter: a HeroUI `Checkbox` beside the search field (the verbose v3 `Checkbox.Content > Checkbox.Control > Checkbox.Indicator` structure is already used in `tripleadersdashboard/page.tsx`). Checked → `.filter(m => m.isActive)`.
- `Table > Table.ScrollContainer > Table.Content > Table.Header/Table.Column` and `Table.Body > Table.Row > Table.Cell`, with `min-w-[92rem]` on `Table.Content` — eleven columns overflow on anything but a wide desktop. `Table.ScrollContainer` (already used at `app/tripleadersdashboard/page.tsx:445`) is HeroUI's own `overflow-x: auto` wrapper; pass `data-scrollbar="thin"` so the scrollbar is a persistent themed one rather than the OS overlay bar that hides until you scroll.
- Columns: Name (`isRowHeader`), Pronouns, Email, Phone, Dues, Policy, Waiver, First Aid, Car Seats, Hitch, Driver.
- **Key rows by `member.id`**, not by name. The trip leaders dashboard keys by name and looks rows back up by name, which collides on duplicate names — with 1596 members that will happen.
- Rendering: `duesStatus` as readable text ("Paid" / "Expired" / "No dues data"); `firstAidType ?? "None"`; `phone ?? "—"`; `carCapacity ?? "—"`; `policyAgreement`, `waiverAgreement`, `carHitch` and `driverCertified` as the repo's emoji-with-aria-label pattern:
  ```tsx
  <span aria-label={m.driverCertified ? "Yes" : "No"} role="img">
    {m.driverCertified ? "🟢" : "🛑"}
  </span>
  ```

### 5a. Pagination (client-side)

`@heroui/react` v3.2.1 ships a `Pagination` component (`node_modules/@heroui/react/dist/components/pagination`). It is presentational only — it holds no page state — so the page owns the state and renders the items:

- `Pagination` (root `<nav>`), `Pagination.Summary`, `Pagination.Content` (`<ul>`), `Pagination.Item` (`<li>`), `Pagination.Link` (takes `isActive`), `Pagination.Previous`, `Pagination.Next`, `Pagination.Ellipsis`.
- `Pagination.Link` / `.Previous` / `.Next` extend the react-aria button primitive, so they take `onPress` and `isDisabled` — no `href` needed.

Implementation:

```tsx
const PAGE_SIZE = 50; // local to the page file; not a sitewide value, so not config/constants.ts

const [page, setPage] = useState(1);

const filtered = useMemo(() => /* search + active filter over `members ?? []` */, [members, searchTerm, activeOnly]);

const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
```

Two details that are easy to get wrong:

- **Reset to page 1 whenever `searchTerm` or `activeOnly` changes.** Otherwise a search that narrows to 3 results while sitting on page 12 renders an empty table. Either `useEffect(() => setPage(1), [searchTerm, activeOnly])`, or call `setPage(1)` in the same handlers that set those.
- **Clamp `page` to `pageCount`** when deriving `visible`, so the two never disagree.

Render the page-number list with an ellipsis rather than 32 numbered buttons: first page, last page, and a window around the current page. Show `Pagination.Summary` with the filtered count ("Showing 1–50 of 1595") so the active filter's effect is visible.

Hide the whole `Pagination` block when `pageCount === 1`.

**Centering.** HeroUI's `.pagination` class is `display: flex; width: 100%` with `justify-content: space-between`, which pins the summary to the far left and the page buttons to the far right of the viewport. Pass `className="my-8 w-7/8 justify-center"` to constrain it to the table's width and center the summary and controls as one group. This override is reliable: `@heroui/styles` imports its component CSS into `layer(components)` and declares `@layer theme, base, components, utilities`, so Tailwind's utilities layer wins over the component rule regardless of specificity.

## Not doing

- No navbar entry (per decision above).
- **No server-side pagination or search.** The endpoint still returns all ~1596 rows in one fetch (nine short fields each, roughly 150 KB); pagination happens in the browser. This keeps search correct — it spans the whole roster, not just the current page — and makes paging and filtering instant with no round trip. Moving pagination server-side would mean pushing `search`, `activeOnly`, `page`, and `pageSize` into the query and a request per keystroke. Revisit only if the payload measurably hurts; the render cost, which is the actual problem, is already solved by paging the rows.
- Not touching the pre-existing `firstAidData` casing inconsistency in `memberMiniService.mapMemberRow` (it passes DB-capitalized `{Type, Expires, Verified}` straight into a DTO typed as `{type, expires, verified}`, unlike `tripLeaderMiniService` which unwraps correctly). The new flat DTO sidesteps it entirely. Worth a separate fix.

## Verification

1. **Status logic matches the DB views.** The new query's `is_active` should agree exactly with the `all_members` view's `"Active"` column. Run against the DB:
   ```sql
   SELECT count(*) FROM all_members WHERE "Active" LIKE 'Yes%';
   -- compare with:
   SELECT count(*) FROM member
   WHERE COALESCE((dues_data ->> 'Expires')::date > CURRENT_DATE
     AND waiver_agreement = true AND policy_agreement = true
     AND holds IS NULL, false);
   ```
   The two counts must be equal. Also confirm the query returns 1596 rows total and throws no cast errors.
2. `npx eslint . --ext .ts,.tsx -c .eslintrc.json --fix` — the repo enforces `import/order`, `react/jsx-sort-props`, and `padding-line-between-statements` (blank line before `return`, blank line after `const` blocks). Note `npm run lint` does not resolve; the `lint` key in `package.json` is misspelled.
3. `npm run build` — required before opening a PR.
4. `npm run dev`, sign in as a member who **is** a trip leader, visit `https://localhost:3000/memberdirectory`. Verify: spinner appears then resolves; all eight columns populate; search filters on name and email and works with capital letters; the active checkbox cuts the list to the ~52 currently-active members and unchecking restores the full list.
5. Pagination specifically: 50 rows on page 1 and the summary reads "Showing 1–50 of 1596"; Previous is disabled on page 1 and Next on the last page; navigate to a high page, then type a search that matches only a few members and confirm the view snaps back to page 1 with results visible (not an empty table); with the active filter on, the pagination control disappears once the result fits one page.
6. Sign in as a member who is **not** a trip leader and visit the same URL — should redirect to `/`. Hitting `/api/protected/memberdirectory` directly should return 401.
7. Signed out, visit `/memberdirectory` — `proxy.ts` should redirect to `/auth/signin`.
8. Confirm the response body contains no `emergencyData` or `medicalData` keys.
9. Resize the browser narrow enough to overflow the table and confirm a horizontal scrollbar appears inside the table rather than the page scrolling sideways, and that the pagination summary and controls stay centered under the table.
