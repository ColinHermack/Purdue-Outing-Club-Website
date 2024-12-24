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
});

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

export async function GET() {
  let openTrips = await getOpenTrips();

  return new Response(JSON.stringify(openTrips), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
