/**
 * Provides utility functions to get leaderboard statistics for the club
 * 
 * @author Colin Hermack
 */

import { LeaderboardRowType } from '@/utils/types';
const { Pool } = require("pg");

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

export async function getMostTripsLed(): Promise<LeaderboardRowType[] | null> {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT member.name AS name, COUNT(*) AS trips FROM trip_roster
                JOIN member ON member.member_id = trip_roster.member_id
                WHERE trip_roster.is_leader = true
                GROUP BY member.member_id
                ORDER BY trips DESC
                LIMIT 5;`
        );

        return result.rows;
    } catch (error: any) {
        return null;
    } finally {
        client.release();
    }
}

export async function getMostTotalTrips(): Promise<LeaderboardRowType[] | null> {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT member.name AS name, COUNT(*) AS trips FROM trip_roster
                JOIN member ON member.member_id = trip_roster.member_id
                GROUP BY member.member_id
                ORDER BY trips DESC
                LIMIT 5;`
        );

        return result.rows;
    } catch (error: any) {
        return null;
    } finally {
        client.release();
    }
}