import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;

    // For example, check if the user's email is in your allowed list
    // const isAuthorized = isAuthenticated &&
    //   (await yourDatabaseCheck(token.email));

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
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
  matcher: ["/api/protected/:path*", "/dashboard"],
};
