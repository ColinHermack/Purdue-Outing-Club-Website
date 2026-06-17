/**
 * Route definition for Microsoft authentication.
 *
 * @author Colin Hermack
 */

import NextAuth from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
