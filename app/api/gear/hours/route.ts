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

interface IGearOfficerMetaData {
    ImagePath: string;
    GearHours: string;
}

interface IGearOfficerData {
    position: string;
    officer_data: IGearOfficerMetaData;
    name: string;
}

interface IGearHoursData {
    name: string;
    hours: string;
}

const getGearHours = async() => {
    let result: typeof QueryResult = null;
    const client = await pool.connect();

    try {
        result = await client.query(`
            SELECT o.position, o.officer_data, m.name FROM officer AS o
            JOIN member AS m ON m.member_id = o.member_id
            WHERE position LIKE '%Gear%';`);
    } catch (error: any) {
        console.error(error);
    } finally {
        client.release();
    }

    return result.rows;
}

export async function GET() {
  let gearHours: IGearOfficerData[] = await getGearHours();

  let cleanedHours: IGearHoursData[] = gearHours.map((officer) => {
    return {
        name: officer.name,
        hours: officer.officer_data.GearHours
    }
  })

  return new Response(JSON.stringify(cleanedHours), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}