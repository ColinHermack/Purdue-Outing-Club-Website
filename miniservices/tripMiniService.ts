/**
 * Handles all database communication related to trips.
 *
 * @author Eli Orlov
 */

"use server";

import { Pool } from "pg";

import TripDTO from "@/dtos/tripDto";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * The shape of a `trip` table row as returned by the database. `startDate`/`endDate`
 * are aliased to camelCase in the queries below; the remaining columns are snake_case.
 */
interface TripRow {
  trip_id: number;
  name: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  sport?: string;
  location?: string;
  description?: string;
  logs?: TripDTO["logs"];
  signup?: boolean;
  difficulty?: number;
}

/**
 * Maps a raw `trip` row from the database into a TripDTO (snake_case -> camelCase).
 *
 * @param row A row from the trip table.
 * @returns The equivalent TripDTO.
 */
function mapTripRow(row: TripRow): TripDTO {
  return {
    tripId: row.trip_id,
    name: row.name,
    startDate: row.startDate,
    endDate: row.endDate,
    category: row.category,
    sport: row.sport,
    location: row.location,
    description: row.description,
    logs: row.logs,
    signup: row.signup,
    difficulty: row.difficulty,
  };
}

/**
 * Queries the database asynchronously to get open trips.
 *
 * @returns An array of TripDTOs representing open trips (empty if the query fails).
 */
export async function getOpenTrips(): Promise<TripDTO[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT trip_id,
              name,
              startdate AT TIME ZONE 'UTC' AS "startDate",
              sport,
              location
      FROM trip
      WHERE trip.signup=true;`,
    );

    return result.rows.map((row: TripRow) => mapTripRow(row));
  } catch {
    return [];
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get trip data.
 *
 * @param id - The ID of the trip to get data for.
 *
 * @returns A TripDTO representing the trip if it exists, else undefined.
 */
export async function getTripData(id: string): Promise<TripDTO | undefined> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
                        trip_id,
                        name,
                        startdate AT TIME ZONE 'UTC' AS "startDate",
                        enddate AT TIME ZONE 'UTC' AS "endDate",
                        category,
                        sport,
                        location,
                        difficulty,
                        description,
                        signup

                    FROM trip WHERE trip_id=$1;`,
      [id],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return mapTripRow(result.rows[0] as TripRow);
  } catch {
    return undefined;
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get all trips a member has attended (is on the roster for).
 *
 * @param memberId - The id of the member whose trips to fetch.
 * @returns An array of TripDTOs the member has attended (empty if the query fails).
 */
export async function getTripsByMemberId(memberId: number): Promise<TripDTO[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT trip.trip_id,
              trip.name,
              trip.startdate AT TIME ZONE 'UTC' AS "startDate",
              trip.enddate AT TIME ZONE 'UTC' AS "endDate",
              trip.category,
              trip.sport,
              trip.location,
              trip.description,
              trip.signup,
              trip.difficulty
      FROM trip_roster
      JOIN trip ON trip.trip_id = trip_roster.trip_id
      WHERE trip_roster.member_id = $1
      ORDER BY trip.trip_id;`,
      [memberId],
    );

    return result.rows.map((row: TripRow) => mapTripRow(row));
  } catch {
    return [];
  } finally {
    client.release();
  }
}
