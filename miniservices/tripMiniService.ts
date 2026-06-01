/**
 * Handles all database communication related to trips.
 *
 */

"use server";

const { Pool, QueryResult } = require("pg");
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
export const getOpenTrips = async () => {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT trip_id, 
              name, 
              startdate AT TIME ZONE 'UTC' AS startdate, 
              sport, 
              location
      FROM trip
      WHERE trip.signup=true;`,
    );
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }

  return result.rows;
};
