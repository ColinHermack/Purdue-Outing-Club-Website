/**
 * NextAuth middleware (Next.js 16 calls middleware "proxy"). Runs before every path in `config.matcher` below and
 * requires a valid session JWT. It only checks that someone is signed in; each protected API route checks roles itself.
 *
 * @author Colin Hermack
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Pages without a session are redirected to sign-in by withAuth. API routes are let through to the function below so
 * that client fetches get a 401 they can act on, instead of a redirect to an HTML page they cannot parse.
 */
export default withAuth(
  function proxy(req) {
    if (!req.nextauth.token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) =>
        !!token || req.nextUrl.pathname.startsWith("/api/"),
    },
    pages: { signIn: "/auth/signin" },
  },
);

// Every page or API path that needs a signed-in user must be listed here. Role checks still happen inside each route.
// Keep /api/automation/* OUT of this list: Power Automate calls it with an API key and has no session.
export const config = {
  matcher: [
    "/api/protected/:path*",
    "/dashboard",
    "/tripleadersdashboard",
    "/memberdirectory",
    "/memberexport",
  ],
};
