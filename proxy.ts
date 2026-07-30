import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    const isTripLeader =
      token.position === "Trip Leader" || token.position === "Officer";

    if (req.nextUrl.pathname.startsWith("/leadTrips") && !isTripLeader) {
      return NextResponse.redirect(new URL("/tripleaders", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

// Specify which routes to protect
export const config = {
  matcher: ["/api/protected/:path*", "/dashboard", "/leadTrips"],
};
