/**
 * Configuration file for Microsoft authentication.
 *
 * Uses the Azure AD app registration owned by poc@purdue.edu (docs/systems/azure-ad.md). Microsoft only redirects
 * back to URIs registered on that app, so NEXTAUTH_URL for each environment must have
 * <NEXTAUTH_URL>/api/auth/callback/azure-ad in the app's redirect URI list. When AZURE_AD_CLIENT_SECRET expires,
 * every sign-in fails until a new secret is created in Azure and set in Vercel.
 *
 * @author Colin Hermack
 */

import AzureADProvider from "next-auth/providers/azure-ad";
import { NextAuthOptions } from "next-auth";

import { verifyMembershipByEmail } from "@/miniservices/memberMiniService";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { params: { scope: "openid profile email User.Read" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the access token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }

      return token;
    },
    async session({ session }) {
      // Send properties to the client

      return session;
    },
    async signIn({ user }) {
      // Only people with a row in the member table may sign in. Rows are created by the dues endpoint and other
      // tools (docs/systems/database.md#who-writes-what), so a new member can sign in once one of those has run.
      try {
        const email: string = user.email ? user.email : "";
        const userExists = await verifyMembershipByEmail(email);
        if (userExists) return true;
        return false;
      } catch {
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    // The sign-in page shows the error instead of retrying, which would loop through Microsoft.
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};
