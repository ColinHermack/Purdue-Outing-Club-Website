"use server";

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

export async function getTripData(id: number) {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT
                        trip_id,
                        name,
                        startdate AT TIME ZONE 'UTC' AS startdate,
                        enddate AT TIME ZONE 'UTC' AS enddate,
                        category,
                        sport,
                        location,
                        description,
                        signup
                    FROM trip WHERE trip_id=$1;`,
      [id],
    );

    return result.rows[0];
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }
}
