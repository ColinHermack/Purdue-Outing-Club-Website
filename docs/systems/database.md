# Database

All club data lives in one production **PostgreSQL 14** database, a **Lightsail managed database** on AWS. A separate
staging database is used for local development (see below). The AWS account (sign-in name `outingclub`) is tied to
the `poc@purdue.edu` Microsoft account. The website, several Power Automate flows, and officers editing by hand all write
to it, so a change here can break something outside this repo.

## Connecting

- Both databases are **Lightsail managed databases**, so AWS runs the server. There is no machine to log in to;
  settings, the master password, and networking are managed from each database's page in the Lightsail console
  (Databases tab).

  | Lightsail name       | Role       | Engine           | Plan                         | Location                  |
  | -------------------- | ---------- | ---------------- | ---------------------------- | ------------------------- |
  | `Database-Version14` | Production | PostgreSQL 14.22 | 1 GB RAM, 2 vCPUs, 40 GB SSD | Ohio, Zone A (us-east-2a) |
  | `Dev-Database`       | Staging    | PostgreSQL 14.22 | 1 GB RAM, 2 vCPUs, 40 GB SSD | Ohio, Zone A (us-east-2a) |

  The endpoint (host name) and port (5432) are on each database's Connect tab. The master user name and password are
  there too; treat them as secrets.

- Credentials are the `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` values. The `.env` file from the
  webmaster points at the **staging** database; the production values are only in Vercel.
- Connections must use **SSL**. The app sets `ssl: { rejectUnauthorized: false }` in every miniservice pool.
- Vercel and Power Automate connect over the public internet, so **public mode** (Networking tab in the Lightsail
  console) is on for both databases and must stay on. Lightsail shows a warning icon on that tab because anyone with
  the user name and password can connect; that is expected, and it is why the password must stay secret.
- Any Postgres client works. Examples:

  ```bash
  psql "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER sslmode=require"
  ```

  or pgAdmin / DBeaver / TablePlus with "SSL mode: require".

- **Which database each environment uses:**

  | Environment                | Database   | Where the credentials live                         |
  | -------------------------- | ---------- | -------------------------------------------------- |
  | Local development (`.env`) | Staging    | `.env`, from the webmaster                         |
  | Vercel preview deployments | Production | Vercel environment variables (same values as prod) |
  | Vercel production          | Production | Vercel environment variables                       |
  | Power Automate flows       | Production | The flows' PostgreSQL connection                   |
  | Tests and CI               | Docker     | `docker-compose.test.yml`, no credentials needed   |

  Writes from a preview deployment change real data. Writes from local development only touch staging.

- Backups (Snapshots & restore tab of each database):
  - **Automatic:** Lightsail keeps one week of backups in five-minute increments. **Emergency restore** creates a
    _new_ database from any point in that week; it does not overwrite the existing one. Point the `DB_*` values at
    the new database afterwards (or rename and swap).
  - **Manual snapshots** are kept until deleted. Production has end-of-semester snapshots named like
    `2024FallEndOfSemester` and `2026SpringEndOfSemester`. Take one before any schema change.

## Who writes what

Check this table before renaming, retyping, or removing any column.

| Table / column                                                                                                    | Written by                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `member` (new rows)                                                                                               | Website `/api/automation/dues` ([Dues - TooCOOL](power-automate.md#dues---toocool)); flows [DocuSign](power-automate.md#docusign---club-sports-waiver), [Info and Policy Agreement](power-automate.md#forms---info-and-policy-agreement), [Dues - Manual](power-automate.md#dues---manual), [Dues - Waived](power-automate.md#dues-waiver-dues---waived-and-onedrive---waiver-upload), [First Aid Modify](power-automate.md#first-aid-and-driver-certification) | The flows set `member_id` to the highest id plus 1, so `recordDuesByEmail` resyncs `member_id_seq` before inserting.                                                                                                                                                                                  |
| `member.dues_data`                                                                                                | Website `/api/automation/dues` (Annual, Fall, Spring); [Dues - Manual](power-automate.md#dues---manual) (`Manual`); [Dues - Waived](power-automate.md#dues-waiver-dues---waived-and-onedrive---waiver-upload) (`Waived`)                                                                                                                                                                                                                                        | The website only ever extends the expiration: if the current one is the same or later (a duplicate receipt, or a Fall receipt, which expires 31 January, processed after an Annual one, which expires 31 August), `dues_data` is left unchanged. The two flows overwrite it with a 31 May expiration. |
| `member.waiver_agreement`                                                                                         | [DocuSign - Club Sports Waiver](power-automate.md#docusign---club-sports-waiver)                                                                                                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                       |
| `member.name`, `policy_agreement`, `phone`, `pronouns`, `school_year`, `campus`, `emergency_data`, `medical_data` | [Info and Policy Agreement](power-automate.md#forms---info-and-policy-agreement)                                                                                                                                                                                                                                                                                                                                                                                | `name` is also rewritten by most other flows when they update a row.                                                                                                                                                                                                                                  |
| `member.car_data`                                                                                                 | [Info and Policy Agreement](power-automate.md#forms---info-and-policy-agreement), [Car Registration](power-automate.md#car-registration)                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                       |
| `member.first_aid_data`                                                                                           | [Info and Policy Agreement](power-automate.md#forms---info-and-policy-agreement), [Forms - First Aid Modify](power-automate.md#first-aid-and-driver-certification)                                                                                                                                                                                                                                                                                              | Written as unverified, then rewritten as verified after the Health & Safety approval. The `update_certified_trigger` copies `Verified` into `trip_leader.process.certified`.                                                                                                                          |
| `member.driver_data`                                                                                              | [Info and Policy Agreement](power-automate.md#forms---info-and-policy-agreement), [Forms - Driver Approvals](power-automate.md#first-aid-and-driver-certification)                                                                                                                                                                                                                                                                                              | A trigger sets `Verified` to false once `Expires` passes.                                                                                                                                                                                                                                             |
| `member.holds`                                                                                                    | Set **by hand** by officers                                                                                                                                                                                                                                                                                                                                                                                                                                     | A non-null hold makes the member inactive.                                                                                                                                                                                                                                                            |
| `member.trip_count`                                                                                               | Database triggers on `trip_roster`                                                                                                                                                                                                                                                                                                                                                                                                                              | Do not write by hand.                                                                                                                                                                                                                                                                                 |
| `member.signup_count`                                                                                             | [Forms - Trip Signup](power-automate.md#forms---trip-signup)                                                                                                                                                                                                                                                                                                                                                                                                    | Adds 1 per accepted sign-up.                                                                                                                                                                                                                                                                          |
| `trip` (new rows)                                                                                                 | [Forms - Trip Requests and Trip Requests - Manual](power-automate.md#trip-and-roster-flows)                                                                                                                                                                                                                                                                                                                                                                     | New trips start with `signup = false`; nothing but a hand edit opens sign-ups. Website only reads `trip`.                                                                                                                                                                                             |
| `trip` (other changes), `trip_roster`                                                                             | Edited **by hand** in a database client                                                                                                                                                                                                                                                                                                                                                                                                                         | Includes opening sign-ups (`signup = true`) and entering each trip's roster after the leader picks it from the sign-up sheet. Roster inserts and deletes fire the `trip_count` and `lead_count` triggers.                                                                                             |
| `trip_leader`                                                                                                     | Website: `/tripleadersdashboard` (`POST`/`PUT /api/protected/tripleaders`)                                                                                                                                                                                                                                                                                                                                                                                      | `lead_count` and `process.certified` are also changed by triggers.                                                                                                                                                                                                                                    |
| `shadow`                                                                                                          | [Shadow Evaluation Approval v2](power-automate.md#shadow-evaluation-approval-v2)                                                                                                                                                                                                                                                                                                                                                                                | Newer than `tests/integration/schema.sql`; regenerate the dump to include it.                                                                                                                                                                                                                         |
| `officer`                                                                                                         | Edited **by hand** each year                                                                                                                                                                                                                                                                                                                                                                                                                                    | Drives `/pleadership`, `/supportus`, `/sponsorship`, `/diversity`, every role check, and the flows' approver lookups.                                                                                                                                                                                 |
| `gear`, `gear_out`                                                                                                | Unused                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Left over from a gear checkout idea. Gear hours come from `officer.officer_data` instead.                                                                                                                                                                                                             |

Four scheduled flows also **read** the `all_members`, `trip_leader_status`, `trip_logs` and `rosters` views into
Google Sheets ([Google sheet mirrors](power-automate.md#google-sheet-mirrors)), so renaming those views or their columns breaks them.

## Tables

`tests/integration/schema.sql` is the authoritative schema (a `pg_dump --schema-only` of production). The summary
below explains what the columns mean.

### `member`

One row per person who has ever interacted with the club. `email` is the Purdue address and is what sign-in matches
on. It has **no unique constraint**; code that looks members up by email assumes there is one row.

The club's own `poc@purdue.edu` row is a service account. Views and the member directory exclude it.

JSON columns (keys are capitalized):

| Column           | Shape                                                                                                             | Meaning                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dues_data`      | `{"Type": "Annual" \| "Fall" \| "Spring" \| "Manual" \| "Waived", "Expires": "YYYY-MM-DD", "Paid": "YYYY-MM-DD"}` | Dues are paid while `Expires > CURRENT_DATE`. Older rows may have `"Paid": true`.                                                 |
| `first_aid_data` | `{"Type": "WFA", "Expires": "YYYY-MM-DD", "Verified": true}`                                                      | `Verified` drives `trip_leader.process.certified` through a trigger.                                                              |
| `driver_data`    | `{"License": "...", "State": "IN", "Expires": "YYYY-MM-DD", "Verified": true}`                                    | A trigger sets `Verified` to false once `Expires` passes. Rows from the SambaSafety form have `"Samba"` as `State` and `License`. |
| `car_data`       | `{"Model": "...", "Nickname": "...", "Color": "...", "Capacity": "5", "Hitch": true}`                             | `Capacity` is a string.                                                                                                           |
| `emergency_data` | `{"Name", "Email", "Phone", "Relation"}`                                                                          | Emergency contact.                                                                                                                |
| `medical_data`   | `{"Allergies", "Conditions", "Medications"}`                                                                      | Sensitive. Never expose through a public route.                                                                                   |

A member is **active** when dues are unexpired, `waiver_agreement` and `policy_agreement` are both true, and `holds`
is null. This rule is written in the `all_members` / `active_members` views and repeated in
`getMemberDirectory()` in `miniservices/memberMiniService.ts`. Change both together (`scripts/check-member-directory-sql.js`
compares them).

### `officer`

One row per officer position per year: `member_id`, `position` (title, for example `"Webmaster"`), `year`, and
`officer_data` JSON (`{"ImagePath": "jane_doe.jpg", "GearHours": "..."}`; `ImagePath` is a file in
`public/leadership/`, `GearHours` is shown on `/gearcloset` for positions containing "Gear"). A person holding two positions has two rows. Several Power Automate flows look up officers by exact `position` to
pick approvers; the list of titles they need is in
[power-automate.md](power-automate.md#officer-positions-the-flows-depend-on). Position titles must exactly match the strings in
`config/permissions.ts` and `config/constants.ts` (`LEADERSHIP_CATEGORIES`). Yearly update steps are in
[runbooks.md](../runbooks.md#yearly-officer-turnover).

### `trip` and `trip_roster`

`trip` holds each trip: dates, `sport`, `category`, `difficulty` (1 to 4, see `DIFFICULTIES` in `config/constants.ts`), `signup` (true while sign-ups are open,
which is what `/trips` lists), `is_cancelled`, and `logs`. `trip_roster` links members to trips with `is_leader`;
officers enter it by hand once a trip's roster is chosen.

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
