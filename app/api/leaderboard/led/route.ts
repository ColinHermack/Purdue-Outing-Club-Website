/**
 * API Endpoint which gets a list of the members who have led the most trips.
 *
 * @author Colin Hermack
 */

import { LeaderboardRowType } from '@/utils/types';
import { getMostTripsLed } from '@/services/leaderboardService';

export async function GET() {
  const retVal: LeaderboardRowType[] | null = await getMostTripsLed();

  if (retVal === null) {
    return new Response(
      JSON.stringify({errorMessage: "Internal server error"}),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify(retVal),
    { 
      status: 200 ,
      headers: { "Content-Type": "application/json" }
    }
  );
}
