/**
 * A protected API endpoint which will return a JSON string containing a member's trip statistics, but only if they
 * are a member of the club.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { MemberStatsT, TripInfoT } from "@/config/types";
import {
  getMemberId,
  getUserName,
  getNumTripsTotal,
  getNumTripsLed,
  getTrips,
  getUserPosition,
} from "@/miniservices/memberMiniService";

export async function GET() {
  const session = await getServerSession(authOptions);

  // If nobody is logged in, or the user is undefined, return a 401 error
  if (
    !session ||
    session.user === undefined ||
    typeof session.user.email !== "string"
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userID: number = await getMemberId(session.user.email); // Get the user's id from the database

  // If the user ID is -1, the user does not exist in the database, so return a 403 error
  if (userID === -1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userStats: MemberStatsT = {
    name: "",
    position: "",
    num_trips_total: 0,
    num_trips_led: 0,
    trips: [],
  };

  userStats.name = await getUserName(userID); // Get the user's name
  userStats.position = await getUserPosition(userID);
  userStats.num_trips_total = await getNumTripsTotal(userID); // Get the number of trips that the user has been on
  userStats.num_trips_led = await getNumTripsLed(userID); // Get the number of trips that the user has led
  userStats.trips = await getTrips(userID); // Get the trip data for the trips that the user has been on

  return NextResponse.json(userStats);
}
