/**
 * Configuration file for Microsoft authentication.
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
      // Check if this user's email exists in your database
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
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};
