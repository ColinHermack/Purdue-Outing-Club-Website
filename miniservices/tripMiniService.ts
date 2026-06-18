/**
 * Handles all database communication related to trips.
 *
 * @author Eli Orlov
 */

"use server";

import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Queries the database asynchronously to get open trips.
 *
 * @returns An array of JSON objects representing open trips.
 */
export async function getOpenTrips() {
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

    return result.rows;
  } catch {
    //Intentionally left blank
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get trip data.
 *
 * @param id - The ID of the trip to get data for.
 *
 * @returns A JSON object representing the trip data if the trip exists, else undefined.
 */
export async function getTripData(id: number) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
                        trip_id,
                        name,
                        startdate AT TIME ZONE 'UTC' AS "startDate",
                        enddate AT TIME ZONE 'UTC' AS enddate,
                        category,
                        sport,
                        location,
                        difficulty,
                        description,
                        signup
                        
                    FROM trip WHERE trip_id=$1;`,
      [id],
    );

    return result.rows[0];
  } catch {
    //Intentionally left blank
  } finally {
    client.release();
  }
}
