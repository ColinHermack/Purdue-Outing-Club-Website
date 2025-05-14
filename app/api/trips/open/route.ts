/**
 * Serves a JSON string containing the open trips.
 *
 * @author Colin Hermack
 */

const { Pool, QueryResult } = require("pg"); //PostgreSQL

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpoint

// Create a new pool of database connections
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
const getOpenTrips = async () => {
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

/**
 * The actual route handler.
 *
 * @returns An HTTPS response object.
 */
export async function GET() {
  let openTrips = await getOpenTrips();

  return new Response(JSON.stringify(openTrips), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
