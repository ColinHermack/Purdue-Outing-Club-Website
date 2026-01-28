/**
 * API Endpoint which gets a list of the members who have been on the most trips.
 *
 * @author Colin Hermack
 */

import { LeaderboardRowType } from '@/utils/types';
import { getMostTotalTrips } from '@/services/leaderboardservice';

export async function GET() {
  const retVal: LeaderboardRowType[] | null = await getMostTotalTrips();

  if (retVal === null) {
    return new Response(
      JSON.stringify({ errorMessage: "Internal server error" }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify(retVal),
    { 
      status: 200,
      headers: { "Content-Type": "application/json"}
    }
  )
}
