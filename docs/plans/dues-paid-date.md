# Fix: dues_data.Paid stores receipt date, not `true`

## Context

`POST /api/automation/dues` (`app/api/automation/dues/route.ts`) calls `recordDuesByEmail` in
`miniservices/memberMiniService.ts`. Both SQL statements there build
`json_build_object('Type', ..., 'Expires', ..., 'Paid', true)`. `Paid` should be the date the
receipt was received (the day the endpoint runs), as `YYYY-MM-DD`, like `Expires`.

Nothing in the app reads `Paid` (dues status is derived from `Expires` only), so the change is
write-side only. Key keeps its existing capitalization, `Paid`, matching `Type`/`Expires`.

## Changes

0. Save this plan to `docs/plans/dues-paid-date.md` (user's CLAUDE.md: plans live in the repo).

1. `miniservices/memberMiniService.ts`, `recordDuesByEmail`:
   - UPDATE (line ~353) and INSERT (line ~373): replace `'Paid', true` with
     `'Paid', CURRENT_DATE::text`.
   - Use the DB clock, same as the rest of this file (directory status compares against
     `CURRENT_DATE`). No signature change, so the route and its unit test stay untouched.
   - When an existing later expiration is kept (duplicate/late receipt), `dues_data` is left
     as-is, so the original `Paid` date survives. Intended.
   - Update the doc comment to mention `Paid` is set to today's date.

2. `tests/integration/miniservices/member.test.ts`: the three assertions with `Paid: true`
   (lines ~157, ~167, ~213) become `Paid: <today>`, computed as
   `new Date().toISOString().slice(0, 10)` (same idiom as the `yesterday` helper in that file).
   Hoist one `const today = ...` in the describe block.

3. `docs/plans/dues-receipt-endpoint.md` line 17: `Paid` (bool) becomes `Paid` (date the receipt
   was recorded). Line 37 SQL snippet updated to match.

Not changed: `tests/integration/seed.sql` and `tests/unit/helpers.ts` keep `Paid: true`, since
existing prod rows and other tools still use the boolean and nothing reads it. Existing prod rows
are not backfilled.

## Verification

- `npm run test:db && npm run test:integration` (the `recordDuesByEmail` tests cover update,
  replace, keep-later, case-insensitive, and insert paths).
- `npm test`, `npm run typecheck`, `npx eslint .`.
