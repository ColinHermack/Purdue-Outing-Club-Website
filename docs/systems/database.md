# Database

All club data lives in one **PostgreSQL 14** database hosted on **AWS Lightsail**. The AWS account is tied to the
`poc@purdue.edu` Microsoft account. The website, several Power Automate flows, and officers editing by hand all write
to it, so a change here can break something outside this repo.

## Connecting

- Credentials are the `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` values in `.env` (from the
  webmaster) or the Lightsail database page.
- Connections must use **SSL**. The app sets `ssl: { rejectUnauthorized: false }` in every miniservice pool.
- Vercel and Power Automate connect over the public internet, so the database must stay reachable from outside AWS
  (for a Lightsail managed database this is the **public mode** setting). TODO(handoff): confirm whether this is a
  Lightsail managed database or Postgres installed on a Lightsail instance.
- Any Postgres client works. Examples:

  ```bash
  psql "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER sslmode=require"
  ```

  or pgAdmin / DBeaver / TablePlus with "SSL mode: require".

- **There is no staging database.** Local development, Vercel previews, and production all use the same database. Be
  careful when testing writes locally; use the Docker test database (see [tests/README.md](../../tests/README.md))
  for anything destructive.
- Backups: TODO(handoff): confirm whether automatic Lightsail snapshots are enabled and how long they are kept. Take a
  manual snapshot in the Lightsail console before any schema change.

## Who writes what

Check this table before renaming, retyping, or removing any column.

| Table / column                                                                                                                              | Written by                                                                                                                              | Notes                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `member` (new rows)                                                                                                                         | Website: `/api/automation/dues` (Dues flow) creates a row when a receipt arrives for an unknown email. Other tools also insert members. | Other inserters set `member_id` themselves, so `recordDuesByEmail` resyncs `member_id_seq` before inserting. TODO(handoff): confirm which other tool inserts members (the Forms flow?). |
| `member.dues_data`                                                                                                                          | Website: `/api/automation/dues`, called by the [Dues flow](power-automate.md#dues---toocool)                                            | Never shortened by a late receipt.                                                                                                                                                      |
| `member.waiver_agreement`                                                                                                                   | [DocuSign flow](power-automate.md#docusign---club-sports-waiver) via the Power Automate PostgreSQL connector                            |                                                                                                                                                                                         |
| `member.name`, `member.policy_agreement`                                                                                                    | [Forms flow](power-automate.md#forms---info-and-policy-agreement) via the PostgreSQL connector                                          |                                                                                                                                                                                         |
| `member.first_aid_data`, `driver_data`, `car_data`, `emergency_data`, `medical_data`, `phone`, `pronouns`, `school_year`, `campus`, `holds` | TODO(handoff): which flow or person writes these (first aid and driver forms are linked from `/join` and `/drivers`)                    |                                                                                                                                                                                         |
| `member.trip_count`, `signup_count`                                                                                                         | Database triggers on `trip_roster`                                                                                                      | Do not write by hand.                                                                                                                                                                   |
| `trip`, `trip_roster`                                                                                                                       | Other Power Automate flows, not yet documented ([stub](power-automate.md#trip-and-roster-flows))                                        | Website only reads them.                                                                                                                                                                |
| `trip_leader`                                                                                                                               | Website: `/tripleadersdashboard` (`POST`/`PUT /api/protected/tripleaders`)                                                              | `lead_count` and `process.certified` are also changed by triggers.                                                                                                                      |
| `officer`                                                                                                                                   | Edited **by hand** each year                                                                                                            | Drives `/pleadership`, `/supportus`, `/sponsorship`, `/diversity` and every role check.                                                                                                 |
| `gear`, `gear_out`                                                                                                                          | Unused                                                                                                                                  | Left over from a gear checkout idea. Gear hours come from `officer.officer_data` instead.                                                                                               |

## Tables

`tests/integration/schema.sql` is the authoritative schema (a `pg_dump --schema-only` of production). The summary
below explains what the columns mean.

### `member`

One row per person who has ever interacted with the club. `email` is the Purdue address and is what sign-in matches
on. It has **no unique constraint**; code that looks members up by email assumes there is one row.

The club's own `poc@purdue.edu` row is a service account. Views and the member directory exclude it.

JSON columns (keys are capitalized):

| Column           | Shape                                                                                     | Meaning                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `dues_data`      | `{"Type": "Annual" \| "Fall" \| "Spring", "Expires": "YYYY-MM-DD", "Paid": "YYYY-MM-DD"}` | Dues are paid while `Expires > CURRENT_DATE`. Older rows may have `"Paid": true`. |
| `first_aid_data` | `{"Type": "WFA", "Expires": "YYYY-MM-DD", "Verified": true}`                              | `Verified` drives `trip_leader.process.certified` through a trigger.              |
| `driver_data`    | `{"License": "...", "State": "IN", "Expires": "YYYY-MM-DD", "Verified": true}`            | A trigger sets `Verified` to false once `Expires` passes.                         |
| `car_data`       | `{"Model": "...", "Nickname": "...", "Color": "...", "Capacity": "5", "Hitch": true}`     | `Capacity` is a string.                                                           |
| `emergency_data` | `{"Name", "Email", "Phone", "Relation"}`                                                  | Emergency contact.                                                                |
| `medical_data`   | `{"Allergies", "Conditions", "Medications"}`                                              | Sensitive. Never expose through a public route.                                   |

A member is **active** when dues are unexpired, `waiver_agreement` and `policy_agreement` are both true, and `holds`
is null. This rule is written in the `all_members` / `active_members` views and repeated in
`getMemberDirectory()` in `miniservices/memberMiniService.ts`. Change both together (`scripts/check-member-directory-sql.js`
compares them).

### `officer`

One row per officer position per year: `member_id`, `position` (title, for example `"Webmaster"`), `year`, and
`officer_data` JSON (`{"ImagePath": "jane_doe.jpg", "GearHours": "..."}`; `ImagePath` is a file in
`public/leadership/`, `GearHours` is shown on `/gearcloset` for positions containing "Gear"). A person holding two positions has two rows. Position titles must exactly match the strings in
`config/permissions.ts` and `config/constants.ts` (`LEADERSHIP_CATEGORIES`). Yearly update steps are in
[runbooks.md](../runbooks.md#yearly-officer-turnover).

### `trip` and `trip_roster`

`trip` holds each trip: dates, `sport`, `category`, `difficulty` (1 to 4, see `DIFFICULTIES` in `config/constants.ts`), `signup` (true while sign-ups are open,
which is what `/trips` lists), `is_cancelled`, and `logs`. `trip_roster` links members to trips with `is_leader`.

### `trip_leader`

One row per approved or in-progress trip leader: `sport` (one comma-separated string such as
`"Backpacking, Caving"`; the miniservice splits it into an array), `process` JSON
(`{"certified": bool, "shadow": bool, "approved": bool}`), `lead_count`, and `gmail` (the leader's personal Gmail
address, edited on `/tripleadersdashboard`).

## Views

Views are used by officers in their database client and by flows. The website only relies on the active-member rule.

| View                   | Shows                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `all_members`          | Every member (except `poc@purdue.edu`) with a readable status such as `No Dues IPA CSW` (IPA = info and policy agreement, CSW = club sports waiver). |
| `active_members`       | Only active members, with first aid, driver and car summaries.                                                                                       |
| `invalid_members`      | Members missing dues, waiver, or policy agreement.                                                                                                   |
| `potential_dues_fails` | Signed both agreements but have no dues record.                                                                                                      |
| `driver_expired`       | Members whose driver certification expired.                                                                                                          |
| `pofficers`            | Officers with positions and personal emails.                                                                                                         |
| `rosters`              | One line per trip with its roster as text.                                                                                                           |
| `trip_leader_status`   | Each trip leader and what is left in their process.                                                                                                  |
| `trip_logs`            | Trip log entries.                                                                                                                                    |

## Triggers

| Trigger                                                 | On                             | Effect                                                                 |
| ------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| `after_insert_trip_roster` / `after_delete_trip_roster` | `trip_roster`                  | Keep `member.trip_count` current.                                      |
| `after_leader_insertion` / `after_leader_deletion`      | `trip_roster`                  | Keep `trip_leader.lead_count` current.                                 |
| `update_certified_trigger`                              | `member.first_aid_data` update | Copies `first_aid_data.Verified` into `trip_leader.process.certified`. |
| `driver_set_verified_false`                             | `member` insert/update         | Sets `driver_data.Verified` to false when the license is expired.      |

## Changing the schema

1. Take a Lightsail snapshot.
2. Check the [writer table](#who-writes-what). If a Power Automate flow writes the column, update the flow in the same
   change window. Flows fail quietly when a column disappears.
3. Apply the change with your database client.
4. Regenerate `tests/integration/schema.sql`:

   ```bash
   pg_dump --schema-only --no-owner --no-privileges --schema=public \
     -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_DATABASE> > tests/integration/schema.sql
   ```

5. Update `tests/integration/seed.sql` (fake data only), the model, DTO, miniservice mapping, and tests.
