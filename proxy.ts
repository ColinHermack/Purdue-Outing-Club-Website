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

// Specify which routes to protect
export const config = {
  matcher: [
    "/api/protected/:path*",
    "/dashboard",
    "/tripleadersdashboard",
    "/memberdirectory",
    "/memberexport",
  ],
};
