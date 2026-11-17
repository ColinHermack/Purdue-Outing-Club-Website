# Power Automate flows

Several [Power Automate](https://make.powerautomate.com) cloud flows keep member records up to date without anyone
typing into the database. **All of them are owned by the `poc@purdue.edu` Microsoft account**, and none of them live
in this repo. Sign in to Power Automate as `poc@purdue.edu` and open **My flows** to see or edit them.

> **Warning:** most of these flows write straight to Postgres through the PostgreSQL connector. If you rename,
> retype, or remove a `member` column they use, the flow starts failing. The only alert is Power Automate's failure
> email to `poc@purdue.edu`; nothing retries or fixes the record. Check [database.md](database.md#who-writes-what)
> before any schema change.

**When any flow fails**, Power Automate emails `poc@purdue.edu` and nothing else happens: the member's row is simply
not updated. Someone has to read that email, fix the cause, and resubmit the run (see
[Checking that flows are healthy](#checking-that-flows-are-healthy)).

**Matching and new members:** every member flow below finds the member by email. If no `member` row has that email,
the Dues, DocuSign and Forms flows **create a new row**; otherwise they update the existing one.

| Flow                                                                      | Trigger                                                | Writes                                                                                                                                       | How it reaches the database                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Dues - TooCool](#dues---toocool)                                         | TooCool receipt email to `poc@purdue.edu`              | `member.dues_data` (and new `member` rows)                                                                                                   | HTTP call to the website's `/api/automation/dues` |
| [DocuSign - Club Sports Waiver](#docusign---club-sports-waiver)           | Signed waiver email from DocuSign to `poc@purdue.edu`  | `member.waiver_agreement = true` (and new rows)                                                                                              | PostgreSQL connector                              |
| [Forms - Info and Policy Agreement](#forms---info-and-policy-agreement)   | New Microsoft Forms response                           | `member.name`, `policy_agreement`, `phone`, `pronouns`, `school_year`, `campus`, `car_data`, `emergency_data`, `medical_data` (and new rows) | PostgreSQL connector                              |
| [First aid and driver certification](#first-aid-and-driver-certification) | New response on the first aid or driver Microsoft Form | `member.first_aid_data`, `member.driver_data`                                                                                                | PostgreSQL connector                              |
| [Trip and roster flows](#trip-and-roster-flows)                           | Not yet documented                                     | `trip`, `trip_roster`                                                                                                                        | Not yet documented                                |

## Dues - TooCool

Members pay dues in the club's TooCool store (the "Pay Dues" button on `/join`). TooCool emails a PDF receipt to
`poc@purdue.edu`, and this flow hands it to the website, which decides what was paid and updates the member.

```mermaid
sequenceDiagram
    participant T as TooCool
    participant O as poc@purdue.edu mailbox
    participant F as Dues - TooCool flow
    participant W as /api/automation/dues
    participant D as Postgres
    T->>O: Receipt email with PDF
    O->>F: New email trigger
    F->>W: POST {email, receipt (base64 PDF)}<br/>Authorization: Bearer DUES_API_KEY
    W->>W: Read PDF, find "Club Dues - Annual / Fall Semester / Spring Semester"
    W->>D: recordDuesByEmail (update or create member)
    W-->>F: 200/201 JSON, or 4xx/5xx
```

### Request the flow sends

```http
POST https://www.purdueoutingclub.com/api/automation/dues
Authorization: Bearer <DUES_API_KEY>
Content-Type: application/json

{ "email": "member@purdue.edu", "receipt": "<base64 of the receipt PDF>" }
```

The flow takes the member's email from the **body of the TooCool receipt email** and sends it as `email`. The
website then matches it case-insensitively against `member.email`.

### Responses

| Status | Meaning                                                                                 | What to do                                            |
| ------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `200`  | Existing member updated. Body: `{ email, type, expires, created: false }`               | Nothing.                                              |
| `201`  | No member had that email, so one was created, named from the receipt.                   | Check the new member's name looks right.              |
| `400`  | Missing `email`/`receipt`, not a PDF, or unreadable PDF.                                | Look at the failed run's input.                       |
| `401`  | Wrong or missing API key, or `DUES_API_KEY` unset/shorter than 32 characters in Vercel. | Make the flow's key and Vercel's match.               |
| `422`  | The PDF is a TooCool receipt but not for club dues (for example merch).                 | Expected for non-dues purchases.                      |
| `500`  | Database or server error.                                                               | Check Vercel runtime logs for `/api/automation/dues`. |

Rules the website applies (code in `app/api/automation/dues/route.ts` and `utils/duesReceipt.ts`):

- Annual and Spring dues expire on the next Aug 31; Fall dues expire on the next Jan 31.
- A receipt never shortens an existing, later expiration (duplicate or late receipts are harmless).
- If TooCool changes the wording of its line items ("Club Dues - Annual" and so on) or its receipt layout, every
  receipt will come back `422` or get no name. Update the regexes in `utils/duesReceipt.ts` and the tests in
  `tests/unit/utils/duesReceipt.test.ts`.

### Rotating the API key

1. Generate a new key: `openssl rand -base64 48`.
2. Update `DUES_API_KEY` in Vercel (Production and Preview) and redeploy.
3. Update the `Authorization` header in the flow's HTTP action.
4. Resubmit any runs that failed with `401` in between.

### Testing

Run the flow's HTTP action against a preview deployment URL, or call your local dev server with a real receipt PDF:

```bash
curl -k -X POST https://localhost:3000/api/automation/dues \
  -H "Authorization: Bearer $DUES_API_KEY" -H "Content-Type: application/json" \
  -d "{\"email\":\"test@purdue.edu\",\"receipt\":\"$(base64 -i receipt.pdf)\"}"
```

Remember that local and preview deployments write to the **production database**.

If the website returns an error, the run fails and Power Automate emails `poc@purdue.edu`. There is no automatic
retry; fix the cause and resubmit the run.

## DocuSign - Club Sports Waiver

Every member must sign Purdue's club sports waiver through a DocuSign PowerForm (step 3 on `/join`). When a signed
copy is emailed to `poc@purdue.edu`, this flow finds the member and sets `member.waiver_agreement` to `true` using the
Power Automate **PostgreSQL connector**.

- Matching: the flow reads the member's email from the body of the DocuSign email. If no member has that email, it
  creates a new `member` row.
- Failure behavior: failure email to `poc@purdue.edu`, nothing else.
- The PowerForm itself belongs to the club's faculty advisor (Jillian Carr as of November 2026), because only faculty
  and IT staff can create PowerForms. If the waiver link on `/join` needs to change, ask the advisor.
- In the `all_members` view, a missing waiver shows as `CSW`.

## Forms - Info and Policy Agreement

The info and policy agreement is a Microsoft Form (step 2 on `/join`). Each response sets the member's `name` and
`policy_agreement = true`, and fills in the rest of their profile: `phone`, `pronouns`, `school_year`, `campus`,
`car_data`, `emergency_data` and `medical_data`. It writes through the PostgreSQL connector.

- Matching: the respondent's Purdue Microsoft login (the form requires signing in).
- Insert or update: creates a new `member` row when no member has that email, otherwise updates the existing row.
  Because flows insert rows themselves, `member_id_seq` can fall behind; `recordDuesByEmail` resyncs it before its own
  inserts.
- Failure behavior: failure email to `poc@purdue.edu`, nothing else.
- In the `all_members` view, a missing agreement shows as `IPA`.

## First aid and driver certification

Members upload a first aid certification (form linked at the bottom of `/join`) and submit driver certification
details (form linked from `/drivers`). Each form has its own flow that writes `member.first_aid_data` or
`member.driver_data` through the PostgreSQL connector.

- Shapes the flows must write are in [database.md](database.md#member). `first_aid_data.Verified` feeds the
  `trip_leader.process.certified` trigger, and expired `driver_data` is marked unverified by a trigger.
- Matching: the respondent's Purdue Microsoft login.
- **Approval step:** before writing anything, the flow looks up an officer in the database and emails them for
  approval. First aid goes to the **Health & Safety Officer**, driver certification to the **Data Analyst**. The
  member's row is updated only after that officer approves. The flow finds them by `officer.position`, so renaming
  either position, or leaving it empty after turnover, stalls every submission.
- Failure behavior: failure email to `poc@purdue.edu`, nothing else.

## Trip and roster flows

Other flows maintain the `trip` and `trip_roster` tables (trip sign-up forms are linked from each trip page,
`app/trips/[id]/page.tsx`). They are not documented yet. When they are, add a section here using the same headings as
the flows above.

## Checking that flows are healthy

1. Sign in to Power Automate as `poc@purdue.edu`.
2. Open each flow and look at **28-day run history**. Failed runs show the failing step and its input.
3. Check that the PostgreSQL **connection** (Data > Connections) is still authenticated, especially after changing
   `DB_PASSWORD`. A password change breaks every connector-based flow until the connection is updated.
