"use server";

/**
 * A protected API endpoint that returns the club member directory. Restricted to trip leaders,
 * who need the roster's dues, certification and vehicle data when planning trips.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import MemberDirectoryEntryDTO from "@/dtos/memberDirectoryEntryDto";
import MemberDTO from "@/dtos/memberDto";
import TripLeaderDTO from "@/dtos/tripLeaderDto";
import {
  getMemberByEmail,
  getMemberDirectory,
} from "@/miniservices/memberMiniService";
import { getTripLeader } from "@/miniservices/tripLeaderMiniService";

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 403 });
    }

    const member: MemberDTO | null = await getMemberByEmail(session.user.email);

    if (member === null || member.id === undefined) {
      return new Response(
        `No club member exists with email ${session.user.email}.`,
        { status: 404 },
      );
    }

    const tripLeader: TripLeaderDTO | null = await getTripLeader(member.id);

    if (tripLeader === null) {
      return new Response("You must be a trip leader to view this resource.", {
        status: 401,
      });
    }

    const directory: MemberDirectoryEntryDTO[] = await getMemberDirectory();

    return new Response(JSON.stringify(directory), { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
