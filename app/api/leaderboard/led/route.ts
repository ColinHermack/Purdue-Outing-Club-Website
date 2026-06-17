/**
 * API Endpoint which gets a list of the members who have led the most trips.
 *
 * @author Colin Hermack
 */

import MemberDTO from "@/dtos/memberDto";
import { getMostTripsLed } from "@/miniservices/memberMiniService";

/**
 * GET /api/leaderboard/led
 * @returns An HTTPS response with the top 5 members who led the most trips
 */
export async function GET() {
  try {
    const leaderboard: { tripsLed: number; member: MemberDTO }[] =
      await getMostTripsLed();

    const retVal = leaderboard.map(
      (item: { tripsLed: number; member: MemberDTO }) => ({
        name: item.member.name,
        count: item.tripsLed,
      }),
    );

    return new Response(JSON.stringify(retVal));
  } catch (error: any) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
