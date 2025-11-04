/**
 * A protected API endpoint which will return a JSON string containing a member's trip statistics, but only if they
 * are a member of the club.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { MemberStatsT, TripInfoT } from "@/utils/types";

const { Pool, QueryResult } = require("pg"); //PostgreSQL

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
}); // Initialize pool of database connections

/**
 * Asynchronously queries the database in order to get the user id associated with the member with the
 * email address passed to it.
 *
 * @returns A promise that resolves to the id of the member with the email address, or -1 if it does not exist.
 */
async function getMemberId(email: string): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT member_id FROM member WHERE email = $1;",
      [email],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].member_id;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Asynchronously queries the database and gets the user's full name based on their ID number.
 *
 * @param userID The user's ID number from the database.
 * @returns A promise which resolves to a string containing the user's full name if the user is found, otherwise it
 * resolves to an empty string
 */
async function getUserName(userID: number): Promise<string> {
  const client = await pool.connect();

  try {
    let result: typeof QueryResult = await client.query(
      "SELECT name FROM member WHERE member_id = $1",
      [userID],
    );

    if (result === null || result.rows.length === 0) {
      return "";
    } else {
      return result.rows[0].name;
    }
  } catch (error: any) {
    return "";
  } finally {
    client.release();
  }
}

/**
 * Asynchronously queries the database to get the user's position in the club based on their ID. The method for this is
 * as follows:
 * 1. Check if the user exists in the officers table, and get their officer position if they do.
 * 2. If the user doesn't exist in the officers table, check if they exist in the trip leaders table.
 * 3. If they don't exist in either of those, then they must be a general member.
 */

async function getUserPosition(userID: number): Promise<string> {
  const client = await pool.connect();

  try {
    let result: typeof QueryResult = await client.query(
      "SELECT * FROM officer WHERE member_id = $1",
      [userID],
    );

    if (result !== null && result.rows.length !== 0) {
      return result.rows[0].position;
    } else {
      let result = await client.query(
        "SELECT * FROM trip_leader WHERE member_id = $1",
        [userID],
      );

      if (result !== null && result.rows.length !== 0) {
        return "Trip Leader";
      } else {
        return "Member";
      }
    }
  } catch (error: any) {
    return "";
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the number of trips that a member has signed up for.
 *
 * @param userID The ID of the member to get the number of trips from.
 * @returns A promise that resolves to the number of trips that the member is signed up for, or -1 if the query fails.
 */
async function getNumTripsTotal(userID: number): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT COUNT(*) FROM trip_roster WHERE member_id = $1;",
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].count;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the number of trips that a member has led.
 *
 * @param userID The ID of the member to get the number of trips from.
 * @returns A promise that resolves to the number of trips that the member has led, or -1 if the query fails.
 */
async function getNumTripsLed(userID: number): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT COUNT(*) FROM trip_roster WHERE member_id = $1 AND is_leader = true;",
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].count;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the trips that a member has signed up for.
 *
 * @param userID The ID of the member to get the trips from.
 * @returns A promise that resolves to an array of objects containing the trip's ID and name, or an empty array if the query fails.
 */
async function getTrips(userID: number): Promise<TripInfoT[]> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `
            SELECT trip.trip_id, trip.name FROM trip_roster
            JOIN trip ON trip.trip_id = trip_roster.trip_id
            WHERE member_id=$1
            ORDER BY trip_id;`,
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return [];
    } else {
      return result.rows;
    }
  } catch (error: any) {
    return [];
  } finally {
    client.release();
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  // If nobody is logged in, return a 401 error
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If the user is undefined, return a 401 error
  if (session.user === undefined) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If the user does not have an email, return a 401 error
  if (typeof session.user.email !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userID: number = await getMemberId(session.user.email); // Get the user's id from the database

  // If the user ID is -1, the user does not exist in the database, so return a 403 error
  if (userID === -1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let userStats: MemberStatsT = {
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
