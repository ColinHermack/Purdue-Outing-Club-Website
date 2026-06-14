import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;

    // For example, check if the user's email is in your allowed list
    // const isAuthorized = isAuthenticated &&
    //   (await yourDatabaseCheck(token.email));

    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/signin", req.url);

      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

      return NextResponse.redirect(signInUrl);
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
  matcher: ["/api/protected/:path*", "/dashboard", "/tripleadersdashboard"],
};
