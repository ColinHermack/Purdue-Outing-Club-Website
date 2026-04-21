/**
 * API route that redirects to the Azure AD logout endpoint to fully terminate
 * the Microsoft SSO session after NextAuth has cleared its own session cookie.
 *
 * @author Colin Hermack
 */

import { redirect } from "next/navigation";

export async function GET() {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const postLogoutRedirectUri = process.env.NEXTAUTH_URL ?? "/";

  const logoutUrl =
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout` +
    `?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

  redirect(logoutUrl);
}
