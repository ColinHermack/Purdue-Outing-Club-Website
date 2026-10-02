# Dues receipt endpoint for Power Automate

## Context

The treasurer's mailbox receives TooCool receipt emails. A Power Automate cloud flow will forward each receipt PDF plus the member's email to a new endpoint, which classifies the receipt (annual / fall / spring) and updates that member's `dues_data`. The caller is a machine, so NextAuth sessions don't apply. Since it writes payment status, it must be callable **only** with an API key: a logged-in member without the key gets 401.

Decisions (from Q&A):
- Auth: shared API key in env var `DUES_API_KEY`, sent as `Authorization: Bearer <key>`. No session auth accepted.
- Expiry: annual and spring expire next Aug 31; fall expires next Jan 31 (computed from today).
- No extra receipt checks (PAID, order number dedupe, order date). The API key is the trust boundary.
- Flow source: TooCool's receipt email to a club inbox.

Step 0 of implementation: copy this plan to `docs/plans/dues-receipt-endpoint.md` (user rule: plans live in the repo).

## Existing facts

- `dues_data` is a `json` column with keys `Type` (`"Annual"` / `"Fall"` / `"Spring"`, confirmed by the user), `Expires` (date string), `Paid` (bool) (`docs/plans/member-directory.md`, `tests/integration/seed.sql`). Active = `Expires > CURRENT_DATE`.
- `proxy.ts` matcher gates `/api/protected/*` with NextAuth and redirects to sign-in, so the new route must live **outside** `/api/protected`.
- Route/miniservice/test patterns: `app/api/protected/tripleaders/route.ts`, `miniservices/memberMiniService.ts`, `tests/unit/helpers.ts`.

## Changes

### 1. Dependency: `unpdf`
Serverless-friendly wrapper around the same pdf.js the POC used. Avoids pdfjs-dist worker/bundling problems in Next route handlers on Vercel. `extractText(new Uint8Array(buf), { mergePages: true })` returns the text.

### 2. `utils/duesReceipt.ts` (new, pure, no I/O except PDF parse)
- `classifyReceiptText(text): "annual" | "fall" | "spring" | "other"`: collapse whitespace, then the POC's regexes in order (`/club dues\s*-\s*annual/i`, `...fall semester`, `...spring semester`).
- `classifyReceipt(pdf: Uint8Array)`: `extractText` then `classifyReceiptText`.
- `duesExpiration(kind, today = new Date()): string` (`YYYY-MM-DD`): next Aug 31 strictly after today for annual/spring, next Jan 31 for fall (strictly, since active means `Expires > CURRENT_DATE`). `// ponytail:` note that an annual paid in July only covers ~1 month; switch to an academic-year rule if early renewals happen.

### 3. `miniservices/memberMiniService.ts`: add `updateDuesByEmail(email, type: "Annual" | "Fall" | "Spring", expires): Promise<string | null>`
Returns the resulting `Expires`, or `null` if no member matches. Never shortens an existing later expiry:
```sql
UPDATE member
SET dues_data = CASE
    WHEN (dues_data ->> 'Expires')::date >= $3::date THEN dues_data
    ELSE json_build_object('Type', $2::text, 'Expires', $3::text, 'Paid', true)
END
WHERE lower(email) = lower($1)
RETURNING dues_data ->> 'Expires' AS expires;
```

### 4. `app/api/automation/dues/route.ts` (new), `POST` only
1. Auth first, before reading the body. Fail closed: if `DUES_API_KEY` is unset or < 32 chars, or header missing/wrong, return 401. Compare `sha256(provided)` vs `sha256(expected)` with `crypto.timingSafeEqual` (equal-length digests, no length leak).
2. Body: JSON `{ "email": string, "receipt": string }`, `receipt` = base64 PDF (Power Automate's Outlook attachment `contentBytes` is already base64, so no multipart). Bad JSON, missing fields, or not starting with `%PDF-` after decode: 400.
3. `classifyReceipt`; parse failure: 400; `"other"`: 422 `"Not a club dues receipt"`.
4. `updateDuesByEmail(email, DUES_TYPES[kind], duesExpiration(kind))`; `null`: 404.
5. 200 `{ email, type: kind, expires }`. Outer try/catch: 500, matching the tripleaders route.

Not added to `proxy.ts` matcher (it would redirect the flow to sign-in). No `permissions.ts` constant (not a role check).

### 5. Docs
- `CLAUDE.md` Environment: add `DUES_API_KEY` (generate with `openssl rand -base64 48`; set in Vercel prod + preview and in the flow).

## Tests

- `tests/unit/utils/duesReceipt.test.ts`: classifier cases (annual, fall, spring, `Club Dues - Annual` spacing, case-insensitive, other); `duesExpiration` boundaries (Aug 30, Aug 31 itself, Sep 1, Jan 30, Jan 31, Feb 1); one `classifyReceipt` round-trip on a synthetic PDF built by a small `pdfWithText(text)` helper added to `tests/unit/helpers.ts` (fake text only, never the real receipt).
- `tests/unit/app/api/automation/dues.test.ts` (mock `@/miniservices/memberMiniService`, `vi.stubEnv`): 401 for missing header, wrong key, unset/short env key, and a valid NextAuth session with no key; 400 bad JSON / missing fields / non-PDF; 422 other; 404 unknown member; 200 calls `updateDuesByEmail` with expected args.
- `tests/integration/miniservices/member.test.ts` (`beforeEach(resetDb)` block): null dues gets set (Carol), expired dues replaced (Bob), later expiry kept (Alice, +180d vs an earlier date), mixed-case email matches, unknown email returns null.

## Power Automate side (for the PR description, not code)
HTTP action (premium): `POST https://purdueoutingclub.com/api/automation/dues`, header `Authorization: Bearer <key>`, `Content-Type: application/json`, body `{"email": ..., "receipt": attachment contentBytes}`. Turn on **Secure inputs** for the action so the key isn't visible in run history; store the key as a secret environment variable if available. Filter the trigger to TooCool's sender address so arbitrary emailed PDFs never reach the endpoint.

## Verification
- `npm test`, `npm run test:db && npm run test:integration`, `npx eslint .`, `npm run typecheck`, `npm run build`.
- Manual: `npm run dev`, then `curl -k -X POST https://localhost:3000/api/automation/dues -H "Authorization: Bearer $DUES_API_KEY" -H 'Content-Type: application/json' -d "{\"email\":\"<test member>\",\"receipt\":\"$(base64 -i receipt.pdf)\"}"` against the test DB, plus the same without the header to confirm 401. Ask the user for the sample receipt locally; don't commit it.

## Follow-up: create unknown members (2026-10-01)

An email with no matching member now creates one instead of returning 404.

- Name: `receiptCustomerName` in `utils/duesReceipt.ts` reads the line after the order number, order date and customer ID. If it's missing or doesn't look like a name, the email's local part is used. `readReceipt` replaces `classifyReceipt` and returns `{ kind, name }`.
- `updateDuesByEmail` became `recordDuesByEmail(email, name, type, expires): { expires, created }`: update, else `INSERT` with the email lowercased. `member.email` has no unique constraint, so both run in one transaction holding `pg_advisory_xact_lock(hashtext(lower(email)))`.
- Route returns 201 with `created: true` for a new member, 200 otherwise. No 404.
- New members get only name, email and dues. They can sign in (the `signIn` callback checks `member`) but aren't active until they sign the policy and waiver.
- Dev DB testing found `member_id_seq` behind `max(member_id)` (another tool inserts members with explicit ids), so the insert hit `duplicate key ... "member_pkey"`. The insert branch now takes a global advisory lock and runs `setval('member_id_seq', max(member_id))` before inserting. Covered by an integration test that sets the sequence back to 1.
