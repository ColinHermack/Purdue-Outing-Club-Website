/**
 * API Endpoint which gets a list of the members who have led the most trips.
 * 
 * @author Colin Hermack
 */

const { Pool } = require("pg"); //PostgreSQL

// Create a new database connection pool
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

export async function GET() {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT member.name, COUNT(*) FROM trip_roster
                JOIN member ON member.member_id = trip_roster.member_id
                WHERE trip_roster.is_leader = true
                GROUP BY member.member_id
                ORDER BY COUNT(*) DESC
                LIMIT 5;
        `);
        return new Response(JSON.stringify(result.rows));
    } catch (error: any) {
        return new Response("Internal Server Error", { status: 500 });
    }
}