/**
 * Serves an array of JSON strings containing the name and hours of each gear officer.
 *
 * @author Colin Hermack
 */

const { Pool, QueryResult } = require("pg"); //PostgreSQL

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpoint

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

// Interface for the gear officer metadata object returned by the database
interface IGearOfficerMetaData {
  ImagePath: string;
  GearHours: string;
}

// Interface for the gear officer object returned by the database
interface IGearOfficerData {
  position: string;
  officer_data: IGearOfficerMetaData;
  name: string;
}

// Interface for the gear hours object to be sent to the client
interface IGearHoursData {
  name: string;
  hours: string;
}

/**
 * Queries the database asynchronously to get gear officer data.
 *
 * @returns An array of JSON objects representing gear officer positions, names, and metadata.
 */
const getGearHours = async () => {
  let result: typeof QueryResult = null;
  const client = await pool.connect(); // Wait for a database connection to become available

  try {
    result = await client.query(`
            SELECT o.position, o.officer_data, m.name FROM officer AS o
            JOIN member AS m ON m.member_id = o.member_id
            WHERE position LIKE '%Gear%';`);
  } catch (error: any) {
    //Intentionally left empty
  } finally {
    client.release();
  }

  return result.rows;
};

/**
 * GET /api/gear/hours
 *
 * Retrieves the hours for all gear officers.
 *
 * @returns An array of JSON objects containing the name and hours of each gear officer.
 */
export async function GET() {
  let gearHours: IGearOfficerData[] = await getGearHours(); // Get an array of gear officer data

  let cleanedHours: IGearHoursData[] = gearHours.map((officer) => {
    return {
      name: officer.name,
      hours: officer.officer_data.GearHours,
    };
  }); // Map over the array and extract only the data we want to send to the client

  return new Response(JSON.stringify(cleanedHours), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  }); // Send a response to the client with code 200 OK
}
