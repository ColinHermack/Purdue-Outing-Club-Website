# Ownership handoff

Use this checklist when the webmaster changes. Work through it together with the outgoing webmaster, and fill in the
**Done** column as you go (commit the updated file so the next handoff has a record).

## Accounts and access

| #   | Item                                   | How                                                                                                                                                                                                                                                                                                                                       | Done |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | **GitHub repository**                  | The repo lives on the personal account `ColinHermack`. Either transfer it (Settings > Danger Zone > Transfer) to the new webmaster or, better, to a club GitHub organization so it survives future handoffs. GitHub redirects the old URL, and Vercel's Git connection must be re-checked afterwards (Vercel > Project > Settings > Git). |      |
| 2   | **`CODEOWNERS`**                       | Replace `@ColinHermack` with the new webmaster's GitHub username.                                                                                                                                                                                                                                                                         |      |
| 3   | **Branch protection**                  | Confirm `main` requires a passing CI run and a review from the new owner (GitHub > Settings > Branches).                                                                                                                                                                                                                                  |      |
| 4   | **`poc@purdue.edu` Microsoft account** | Make sure the new webmaster can sign in (credentials and MFA method). This one account owns the Azure AD app registration, all Power Automate flows, the mailbox the flows read, and the AWS account for Lightsail.                                                                                                                       |      |
| 5   | **Club Gmail account**                 | Access to the Gmail account that owns the Vercel team and the club Google Calendar.                                                                                                                                                                                                                                                       |      |
| 6   | **Vercel**                             | Sign in as the club account (team `purdue-outing-clubs-projects`). Optionally invite the new webmaster's own Vercel account as a team member so they can view previews.                                                                                                                                                                   |      |
| 7   | **AWS Lightsail**                      | Sign in to the AWS account and confirm the production database is visible. Confirm the new webmaster can reach the staging database too.                                                                                                                                                                                                  |      |
| 8   | **Squarespace domain**                 | The domain is in the club Gmail account's Squarespace login. Confirm auto-renew and the payment method.                                                                                                                                                                                                                                   |      |
| 9   | **Power Automate**                     | Sign in as `poc@purdue.edu`, open each flow in [power-automate.md](systems/power-automate.md), and confirm the last runs succeeded.                                                                                                                                                                                                       |      |
| 10  | **`.env` file**                        | Hand over the values securely (password manager share, not email or Slack). Keys are listed in [vercel.md](systems/vercel.md#environment-variables).                                                                                                                                                                                      |      |
| 11  | **Photo script inbox**                 | `GMAIL_USER` / `GMAIL_APP_PASSWORD` for `scripts/fetch_poc_photos.py` point at the outgoing webmaster's inbox. The new webmaster should use their own inbox and app password.                                                                                                                                                             |      |

## After access is confirmed

| #   | Item                            | How                                                                                                                                                       | Done |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 12  | Rotate shared secrets           | Rotate `DB_PASSWORD`, `NEXTAUTH_SECRET`, and `DUES_API_KEY` so the outgoing webmaster's copies stop working ([runbooks.md](runbooks.md#rotate-a-secret)). |      |
| 13  | Mark secrets Sensitive          | In Vercel, `NEXTAUTH_SECRET` and `DB_PASSWORD` are stored as readable variables. Delete and re-create them as **Sensitive** while rotating.               |      |
| 14  | Azure secret expiry             | Note the `AZURE_AD_CLIENT_SECRET` expiry date in [azure-ad.md](systems/azure-ad.md) and set a reminder.                                                   |      |
| 15  | Fill in `TODO(handoff)` markers | `grep -rn "TODO(handoff)" docs` lists facts that still need confirming. The outgoing webmaster is the best person to answer them.                         |      |
| 16  | Update names                    | Replace the outgoing webmaster's name where it matters (`CODEOWNERS`, README contact). `@author` tags in code can stay as history.                        |      |
| 17  | Test the full path              | Make a small PR, watch CI and the preview build, merge, and confirm production updates. Sign in on production.                                            |      |

## Known risks

Things found while writing these docs that a new owner should know about:

- **Domain expires 27 March 2027 with auto-renew off.** Renew it or turn on auto-renew in Squarespace before then.
- **Azure production secret expires 2 November 2027.** See [azure-ad.md](systems/azure-ad.md#rotating-the-client-secret).
- **Single points of failure.** Almost everything depends on `poc@purdue.edu` and the club Gmail account. If either
  is locked out, the site can't be changed or its integrations repaired. Keep recovery options current on both.
- **Previews use the production database.** Only local development uses staging; anything written on a preview
  deployment changes real data.
- **Flows write directly to the database.** Schema changes break the connector-based flows; the only signal is a
  failure email to `poc@purdue.edu`, and failed updates are not retried.
- **No automatic database backups.** Take a manual snapshot in the Lightsail console before any risky change.
- **Sign-in cannot be tested on previews.** Only production and `localhost` are registered in Azure.
- **Waiver depends on the advisor.** The DocuSign PowerForm is owned by the faculty advisor; a new advisor must
  recreate it and the link on `/join` must be updated.
- **TooCool receipt format.** The dues endpoint reads receipt text. A TooCool layout change stops dues updates.
- **Unused code.** `getAllOfficerData()` in `miniservices/officerMiniService.ts` is not called anywhere and joins on
  a column (`o.officer_id`) that does not exist. Delete it or fix it before using it.
