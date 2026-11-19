# Azure AD (Microsoft sign-in)

Members sign in with their Purdue Microsoft account. That works through an **app registration** in Azure AD
(now called Microsoft Entra ID) that is owned by the **`poc@purdue.edu`** account. The code side is described in
[architecture.md](../architecture.md#authentication-and-authorization).

## Where to find it

1. Sign in to the [Azure Portal](https://portal.azure.com) as `poc@purdue.edu`.
2. Go to **Microsoft Entra ID > App registrations > All applications** (or "Owned applications").
3. Open the app whose **Application (client) ID** matches `AZURE_AD_CLIENT_ID` in Vercel.

The app registration is named **Purdue Outing Club Website**.

## Settings the site depends on

| Azure setting                        | Must match                                                             | Used in                                        |
| ------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Application (client) ID              | `AZURE_AD_CLIENT_ID`                                                   | `app/api/auth/[...nextauth]/options.ts`        |
| Directory (tenant) ID                | `AZURE_AD_TENANT_ID` (Purdue's tenant)                                 | `options.ts`, `app/api/azure-signout/route.ts` |
| Client secret value                  | `AZURE_AD_CLIENT_SECRET`                                               | `options.ts`                                   |
| Redirect URIs (Authentication > Web) | `<NEXTAUTH_URL>/api/auth/callback/azure-ad` for each place you sign in | NextAuth callback                              |
| Front-channel / post-logout URL      | `NEXTAUTH_URL`                                                         | `/api/azure-signout`                           |
| API permissions                      | `openid`, `profile`, `email`, `User.Read` (delegated)                  | `options.ts` scope                             |

Redirect URIs registered (Web platform, as of November 2026):

| URI                                                                                                                                                                                                  | Purpose                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `https://www.purdueoutingclub.com/api/auth/callback/azure-ad`                                                                                                                                        | Production sign-in. **Required.**                                                                                            |
| `https://purdueoutingclub.com/api/auth/callback/azure-ad`                                                                                                                                            | Apex domain (redirects to www, kept as a fallback).                                                                          |
| `https://localhost:3000/api/auth/callback/azure-ad`                                                                                                                                                  | Local development. This is why `npm run dev` uses HTTPS.                                                                     |
| `https://outing-club-website-v2-nq2ab31dk-purdue-outing-clubs-projects.vercel.app/api/auth/callback/azure-ad`                                                                                        | One old preview deployment. Every preview has a different URL, so this does not make previews work.                          |
| `https://www.purdueoutingclub.com/dashboard`, `https://purdueoutingclub.com/dashboard`, `https://www.purdueoutingclub.com/tripleadersdashboard`, `https://purdueoutingclub.com/tripleadersdashboard` | Not used by NextAuth, which only redirects to `/api/auth/callback/azure-ad`. Likely left over from an earlier sign-in setup. |

**Sign-in does not work on Vercel previews.** Each preview has its own URL that is not registered here, and
`NEXTAUTH_URL` points at production. Test sign-in locally or on production.

If you see `AADSTS50011: The redirect URI ... does not match`, the URL you are signing in from is missing from this
list, or `NEXTAUTH_URL` is wrong for that environment.

## Rotating the client secret

Client secrets expire (Azure allows at most 24 months). When the secret expires, **every sign-in fails** with an
`invalid_client` error, while the public site keeps working.

There are two client secrets (as of November 2026):

| Secret            | Used by                                              | Expires             |
| ----------------- | ---------------------------------------------------- | ------------------- |
| Production        | `AZURE_AD_CLIENT_SECRET` in Vercel                   | **2 November 2027** |
| Local development | `AZURE_AD_CLIENT_SECRET` in developers' `.env` files | 4 October 2028      |

Set a calendar reminder a month before each date. Update this table whenever you rotate one.

1. In the app registration, open **Certificates & secrets > Client secrets > New client secret**.
2. Copy the **Value** immediately (it is shown only once). The "Secret ID" is not the secret.
3. For the production secret: in Vercel, edit `AZURE_AD_CLIENT_SECRET` and paste the new value. Redeploy production.
4. For the local development secret: update your `.env` and send the new value to anyone else who develops locally.
5. Sign in on production to confirm, then delete the old secret in Azure.

## Who can sign in

Azure lets any account in the Purdue tenant authenticate, but the site's `signIn` callback only accepts emails that
have a row in the `member` table. To let someone in, they need a `member` row (normally created by paying dues or
filling out the forms). There is nothing to change in Azure.
