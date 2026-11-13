# Dashboard: edit car and emergency contact

## Context

`docs/designs/member-sign-in-design-update.html` updates the `/dashboard` design (desktop and mobile) with two editable cards:
- New **My car** card: view mode (title, detail line, Edit button), empty state ("No car on file. Adding yours helps trip leaders plan rides." plus "Add a car" button), and an inline edit form (Nickname optional, Year make and model, Seats including driver 2 to 15, Has a tow hitch checkbox, Remove car / Cancel / Save).
- **Emergency contact** card gets an Edit button and an inline form (Name, Relationship, Phone 10 digits, Cancel / Save).
- Standalone boards show states: Editing, Adding (heading "Add a car", button "Add car", no Remove), Error (red 2px border, `aria-invalid`, message below field: "Enter a number from 2 to 15." / "Enter a 10-digit phone number.").
- Mobile: 44px inputs and buttons, Cancel and Save split the row 50/50, Remove car is a full-width text button below. Desktop: Remove car left-aligned, Cancel and Save right.

Today the dashboard is read only and `MemberDTO.carData` is a raw `object` with PascalCase keys.

Decisions from Q&A:
- Design's action links ("How to fix this", "Pay dues", "Sign", "Become a certified driver") stay out. Earlier informational-only decision holds.
- Emergency contact form adds an optional **Email** field (not in the design). Trip Leader Dashboard shows it.
- Phone stored as 10 digits only, displayed as `(765) 555-0142`. Old dashed values get stripped to digits when the form opens.

## DB shapes (from `tests/integration/seed.sql`)

- `car_data` json: `Model`, `Nickname`, `Color`, `Capacity` (string, e.g. `'5'`), `Hitch` (bool).
- `emergency_data` json: `Name`, `Email`, `Phone`, `Relation`.
- Both columns are `json`, not `jsonb`. The `all_members` / export views read these keys, so keep them and keep `Capacity` a string.

## Plan

### 1. DTO and mapping

- `dtos/memberDto.ts`: add `CarDataDTO { model?, nickname?, color?, capacity?, hitch? }`, type `carData?: CarDataDTO`.
- `miniservices/memberMiniService.ts`: type `car_data` in `MemberRow` with the PascalCase keys and map it in `mapMemberRow`, same as the uncommitted firstAid/emergency/medical mapping on this branch.

### 2. Shared validation (`utils/memberForms.ts`, new, no server imports)

Used by the client for inline errors and by routes for 400s.
- `parseCar(body)`: returns `{ value: { nickname, model, seats, hitch } }` or `{ errors: { seats?: string, ... } }`. Seats integer 2 to 15 (required). Nickname and model optional, trimmed, max 100 chars. Hitch boolean.
- `parseEmergencyContact(body)`: name required (trimmed, max 100), relation optional (max 100), phone exactly 10 digits after stripping non-digits, email optional, simple `x@y.z` check, max 254.
- `formatPhone(phone)`: 10 digits gives `(xxx) xxx-xxxx`, anything else returned unchanged.
- Error strings match the design ("Enter a number from 2 to 15.", "Enter a 10-digit phone number."), plus "Enter a name." and "Enter a valid email address."

### 3. Miniservice writes (`miniservices/memberMiniService.ts`)

All match by session email (`WHERE email = $1`, same as `getMemberByEmail`). Each returns the mapped DTO, or `null` when no row matched.
- `updateCarByEmail(email, car)`: merge so unshown keys (`Color`) survive:
  `UPDATE member SET car_data = (COALESCE(car_data::jsonb, '{}') || jsonb_build_object('Nickname', NULLIF($2, ''), 'Model', NULLIF($3, ''), 'Capacity', $4::text, 'Hitch', $5::boolean))::json WHERE email = $1 RETURNING car_data`.
- `removeCarByEmail(email)`: `SET car_data = NULL ... RETURNING member_id`, returns boolean.
- `updateEmergencyContactByEmail(email, contact)`: same merge with `Name`, `Relation`, `Phone`, `Email` (empty email stored as null).

### 4. Routes

Follow `app/api/protected/user/route.ts`: 401 no session email, 403 `!canSignIn(await getMemberAccess(email))`, 500 on throw. Body parsing and 400 like `app/api/protected/tripleaders/route.ts` PUT.
- `app/api/protected/user/car/route.ts`: `PUT` (body `{ nickname, model, seats, hitch }`, 400 on bad JSON or `parseCar` errors, 404 no member, 200 with `CarDataDTO`) and `DELETE` (404 or 204).
- `app/api/protected/user/emergencycontact/route.ts`: `PUT` (body `{ name, relation, phone, email }`, 200 with `EmergencyDataDTO`).
- Both under `/api/protected`, so `proxy.ts` matcher already covers them.
- `public/openapi.json`: add both paths (put, delete, put) with 400/401/403/404/500; add `CarData`, `CarInput`, `EmergencyContactInput` schemas; point `MemberDTO.carData` at `CarData`.

### 5. Dashboard UI

- Move `SideCard` and `Badge` out of `app/dashboard/page.tsx` into `app/dashboard/SideCard.tsx`; rename `badge` prop to `aside` (holds a badge or the Edit button).
- New `app/dashboard/EditableCards.tsx` (client) exporting `CarCard` and `EmergencyContactCard`. Each takes the current value plus `onSaved(next)`, which updates `user` in page state.
  - State: `editing`, `draft`, `errors`, `saving`, `saveFailed`.
  - Edit/Add opens the form with the draft seeded from the current value (phone stripped to digits); first input gets focus. Cancel discards the draft and returns focus to the Edit button.
  - Save runs the shared `parse*` first and shows field errors (`isInvalid` + `FieldError`, so `aria-invalid` and `aria-describedby` come for free). If it passes, `protectedFetch` with `PUT` and a JSON body. On `ok`, call `onSaved` and close. On error or forbidden, show "Couldn't save. Try again." and keep the form open. Buttons are disabled while saving.
  - Remove car: `DELETE`, then `onSaved(undefined)`. No confirm step (design has none).
  - Phone input: `type="tel"`, `inputMode="numeric"`, strips non-digits and caps at 10 on change. Email input `type="email"`.
  - Car view: title `nickname || model || "My car"`, detail `[nickname ? model : "", "N seats", hitch ? "Tow hitch" : "No hitch"]` joined with ` · `. EC view: name, then `relation · formatPhone(phone) · email`. EC empty state: existing text plus an "Add emergency contact" button that opens the same form.
  - Footer layout: desktop `Remove car` uses `sm:mr-auto` on the left; on mobile it uses `order-last w-full`, and Cancel/Save get `flex-1`. Inputs `h-11 sm:h-10`. Use theme tokens (no hex) so dark mode works. Save button uses the existing amber primary style.
- HeroUI v3 `TextField` / `Input` / `Label` / `FieldError` / `Checkbox` (same compound pattern as `app/tripleadersdashboard/page.tsx`). Verify `FieldError`, `isInvalid` and `Checkbox` `isSelected/onChange` against https://heroui.com/react/llms-full.txt before writing.
- `page.tsx`: render `CarCard` after Driver certification, swap the read-only EC card for `EmergencyContactCard`.

### 6. Tests

Unit:
- `tests/unit/utils/memberForms.test.ts`: table-driven cases for seats (empty, 1, 2, 15, 16, 2.5, "abc"), phone (dashed input, 9 digits, 10 digits), email (empty ok, bad, good), name required, overlong strings; `formatPhone`.
- `tests/unit/app/api/protected/user.test.ts` (or `userEdits.test.ts` beside it): for each new handler 401, 403, 400 bad JSON, 400 invalid field, 404, 200/204 with miniservice called with parsed values, 500. Use `jsonRequest(body, "PUT")` from `tests/unit/helpers.ts`.
- `tests/unit/miniservices/memberMiniService.test.ts`: carData mapping; write functions pass expected params and map `RETURNING` rows.
- `tests/unit/openapi.test.ts` passes once spec updated.

Integration (`tests/integration/miniservices/member.test.ts`, `resetDb()` in `beforeEach`):
- Update car for Alice keeps `Color`, writes `Capacity` as string. Add car for Carol (null `car_data`). Remove nulls it. Unknown email returns null.
- Update EC for Alice replaces fields, empty email stores null. Bob (null EC) gets a new contact.

## Out of scope (noted)

`officerMiniService.ts` still passes raw PascalCase `emergency_data` / `car_data` / `first_aid_data`, and `tripLeaderMiniService.ts` still passes raw `car_data`. Both are now typed as the camelCase DTOs but hold PascalCase keys at runtime. No client reads those fields today, so nothing breaks. Fix it separately by reusing the `mapMemberRow`-style mapping there.

## Critical files

`dtos/memberDto.ts`, `miniservices/memberMiniService.ts`, `utils/memberForms.ts` (new), `app/api/protected/user/car/route.ts` (new), `app/api/protected/user/emergencycontact/route.ts` (new), `app/dashboard/page.tsx`, `app/dashboard/SideCard.tsx` (new), `app/dashboard/EditableCards.tsx` (new), `public/openapi.json`, tests listed above.

## Verification

1. `npm test`, `npm run typecheck`, `npx eslint .`.
2. `npm run test:db && npm run test:integration`.
3. `npm run dev`, sign in as a trip leader, open `/dashboard`:
   - Edit car, change seats to 1, Save: red border plus message, no request sent. Fix and save; card updates; reload persists. Check DB `car_data` still has `Color`.
   - Remove car: empty state appears; Add a car: heading/button read "Add a car"/"Add car", no Remove.
   - Edit EC with dashed phone on file: field shows digits; 9 digits errors; save shows `(765) 555-0142`; optional email saves and clears.
   - 390px width: 44px controls, Cancel/Save split, Remove below. Dark mode readable. Keyboard only: Tab through the form, Enter on Save, focus returns to Edit after Cancel.
4. `/api/docs` shows the new endpoints.
