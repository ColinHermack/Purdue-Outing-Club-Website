# `scripts/`

Maintenance scripts run by hand from the repo root. They are not part of the app or the build.

## `fetch_poc_photos.py`

Downloads officer headshots from an email inbox into `public/leadership/`, named `first_last.jpg`, so they match
`officer.officer_data.ImagePath`.

1. Officers email their photo. Forward each email to the inbox below with the subject `POC Photo <Full Name>`.
2. Add these to `.env` (they are only used by this script):
   - `GMAIL_USER`: the Gmail address that receives the forwards.
   - `GMAIL_APP_PASSWORD`: an [app password](https://myaccount.google.com/apppasswords) for it (not the account
     password; requires 2-step verification).
3. Preview, then download:

   ```bash
   python3 scripts/fetch_poc_photos.py --dry-run
   ```

   ```bash
   python3 scripts/fetch_poc_photos.py
   ```

4. Commit the new images and update `PHOTO_SUBMISSIONS.md`.

If an email subject and the member's name disagree, add an entry to `SLUG_OVERRIDES` in the script. Attachments under
20 KB (signature logos) are skipped.

## `check-member-directory-sql.js`

Checks that the member directory query in `miniservices/memberMiniService.ts` (`getMemberDirectory`) computes the same
active/dues/first-aid/driver counts as the `all_members` view. Run it after changing either:

```bash
node scripts/check-member-directory-sql.js
```

It reads `.env` and connects to the **production** database read-only (it only runs `SELECT`s). It prints both sets
of counts and exits non-zero if they differ.
