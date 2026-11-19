/**
 * Route definition for Microsoft authentication. NextAuth serves sign-in, callback, session and sign-out under
 * /api/auth/*. Configuration lives in options.ts.
 *
 * @author Colin Hermack
 */

import NextAuth from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
