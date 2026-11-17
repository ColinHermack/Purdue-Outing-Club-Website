# Azure AD (Microsoft sign-in)

Members sign in with their Purdue Microsoft account. That works through an **app registration** in Azure AD
(now called Microsoft Entra ID) that is owned by the **`poc@purdue.edu`** account. The code side is described in
[architecture.md](../architecture.md#authentication-and-authorization).

## Where to find it

1. Sign in to the [Azure Portal](https://portal.azure.com) as `poc@purdue.edu`.
2. Go to **Microsoft Entra ID > App registrations > All applications** (or "Owned applications").
3. Open the app whose **Application (client) ID** matches `AZURE_AD_CLIENT_ID` in Vercel.

TODO(handoff): record the app registration's display name here so it is easy to find.

## Settings the site depends on

| Azure setting                        | Must match                                                             | Used in                                        |
| ------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Application (client) ID              | `AZURE_AD_CLIENT_ID`                                                   | `app/api/auth/[...nextauth]/options.ts`        |
| Directory (tenant) ID                | `AZURE_AD_TENANT_ID` (Purdue's tenant)                                 | `options.ts`, `app/api/azure-signout/route.ts` |
| Client secret value                  | `AZURE_AD_CLIENT_SECRET`                                               | `options.ts`                                   |
| Redirect URIs (Authentication > Web) | `<NEXTAUTH_URL>/api/auth/callback/azure-ad` for each place you sign in | NextAuth callback                              |
| Front-channel / post-logout URL      | `NEXTAUTH_URL`                                                         | `/api/azure-signout`                           |
| API permissions                      | `openid`, `profile`, `email`, `User.Read` (delegated)                  | `options.ts` scope                             |

Redirect URIs needed:

- `https://www.purdueoutingclub.com/api/auth/callback/azure-ad` (production)
- `https://localhost:3000/api/auth/callback/azure-ad` (local development; this is why `npm run dev` uses HTTPS)

TODO(handoff): confirm the exact list registered in Azure, including any preview URLs.

If you see `AADSTS50011: The redirect URI ... does not match`, the URL you are signing in from is missing from this
list, or `NEXTAUTH_URL` is wrong for that environment.

## Rotating the client secret

Client secrets expire (Azure allows at most 24 months). When the secret expires, **every sign-in fails** with an
`invalid_client` error, while the public site keeps working.

TODO(handoff): record the current secret's expiry date here, and put a calendar reminder a month before it.

1. In the app registration, open **Certificates & secrets > Client secrets > New client secret**.
2. Copy the **Value** immediately (it is shown only once). The "Secret ID" is not the secret.
3. In Vercel, edit `AZURE_AD_CLIENT_SECRET` (all environments) and paste the new value. Redeploy production.
4. Update your local `.env` and send the new value to anyone else who develops locally.
5. Sign in on production to confirm, then delete the old secret in Azure.

## Who can sign in

Azure lets any account in the Purdue tenant authenticate, but the site's `signIn` callback only accepts emails that
have a row in the `member` table. To let someone in, they need a `member` row (normally created by paying dues or
filling out the forms). There is nothing to change in Azure.
