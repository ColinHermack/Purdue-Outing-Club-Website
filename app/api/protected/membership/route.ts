/**
 * API Endpoint which uses next-auth to get the user's session and then queries the database to determine if they are a
 * member of the club.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { verifyMembershipByEmail } from "@/miniservices/memberMiniService";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let isMember = false;

  if (session.user !== undefined && typeof session.user.email === "string") {
    isMember = await verifyMembershipByEmail(session.user.email);
  }

  if (!isMember) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  } else {
    return new Response(
      JSON.stringify({
        message: "Membership verified",
        user: session.user === undefined ? "" : session.user.email,
      }),
      { status: 200 },
    );
  }
}
