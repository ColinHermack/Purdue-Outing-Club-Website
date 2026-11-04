/**
 * Configuration file for Microsoft authentication.
 *
 * @author Colin Hermack
 */

import AzureADProvider from "next-auth/providers/azure-ad";
import { NextAuthOptions } from "next-auth";

import { canSignIn, getMemberAccess } from "@/utils/memberAccess";

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
      // Sign-in is limited to officers and trip leaders for now
      try {
        const email: string = user.email ? user.email : "";

        return canSignIn(await getMemberAccess(email));
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
