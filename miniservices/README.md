# `miniservices/`

The only code that talks to the database. Each file is marked `"use server"`, creates its own `pg.Pool` from the
`DB_*` environment variables (with SSL), runs SQL, and returns DTOs from `dtos/`.

Rules:

- Never import a miniservice from a client component (`"use client"`). Server pages and API routes only.
- Use parameterized queries (`$1`, `$2`). Never build SQL by joining strings with user input.
- Convert `snake_case` columns to camelCase inside `result.rows.map(...)`. DTOs never contain `snake_case`.
- Always `client.release()` in a `finally` block.
- New SQL gets an integration test in `tests/integration/miniservices/`.

## Files

| File                       | Tables                  | Used by                                                                             |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `memberMiniService.ts`     | `member`, `trip_roster` | Sign-in check, dashboard, directory, export, leaderboards, dues endpoint            |
| `officerMiniService.ts`    | `officer`, `member`     | Role checks, `/pleadership`, `/supportus`, `/sponsorship`, `/diversity`, gear hours |
| `tripLeaderMiniService.ts` | `trip_leader`, `member` | Trip leader dashboard, member directory access                                      |
| `tripMiniService.ts`       | `trip`, `trip_roster`   | `/trips`, `/trips/[id]`, dashboard                                                  |

## Watch out for

- `member` is also written by Power Automate flows and by hand. Read
  [docs/systems/database.md](../docs/systems/database.md#who-writes-what) before changing how a column is read or
  written.
- `getMemberDirectory()` repeats the "active member" rule from the `all_members` view.
  `scripts/check-member-directory-sql.js` checks the two agree.
- `getAllOfficerData()` is unused and joins on a column that does not exist (`o.officer_id`). Fix it before using it.
