"use server";

/**
 * A protected API endpoint that returns the trips the currently signed-in user has attended.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import MemberDTO from "@/dtos/memberDto";
import TripDTO from "@/dtos/tripDto";
import { getMemberByEmail } from "@/miniservices/memberMiniService";
import { getTripsByMemberId } from "@/miniservices/tripMiniService";

/**
 * GET /api/protected/user/trips
 *
 * @returns 200 with a TripDTO for every trip the signed-in member is on the roster of, 401 with no session, 404 if
 * the session email has no member row, 500 on a database error.
 */
export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const member: MemberDTO | null = await getMemberByEmail(session.user.email);

    if (member === null || member.id === undefined) {
      return new Response(
        `No club member exists with email ${session.user.email}.`,
        { status: 404 },
      );
    }

    const trips: TripDTO[] = await getTripsByMemberId(member.id);

    return new Response(JSON.stringify(trips), { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
