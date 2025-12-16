/**
 * Provides utility functions to get gear data from the database.
 * 
 * @author Colin Hermack
 */

import { GearOfficerDataType } from '@/utils/types';

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

export async function getAllGearHours(): Promise<GearOfficerDataType[] | null> {
    let result: typeof QueryResult = null;
    const client = await pool.connect();

    try {
        result = await client.query(
            `SELECT o.position, o.officer_data, m.name FROM officer AS o
            JOIN member AS m ON m.member_id = o.member_id
            WHERE position LIKE '%Gear%';`
        );
    } catch (error: any) {
        return null;
    } finally {
        client.release();
    }

    return result.rows;
}