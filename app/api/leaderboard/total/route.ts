/**
 * API Endpoint which gets a list of the members who have been on the most trips.
 *
 * @author Colin Hermack
 */

import MemberDTO from "@/dtos/memberDto";
import { getMostTripsAttended } from "@/miniservices/memberMiniService";

/**
 * GET /api/leaderboard/total
 * @returns A response object containing the members who have been on the 5 most trips as a payload
 */
export async function GET() {
  try {
    const leaderboard: { tripsAttended: number; member: MemberDTO }[] =
      await getMostTripsAttended();

    const retVal = leaderboard.map(
      (item: { tripsAttended: number; member: MemberDTO }) => ({
        name: item.member.name,
        count: item.tripsAttended,
      }),
    );

    return new Response(JSON.stringify(retVal));
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
