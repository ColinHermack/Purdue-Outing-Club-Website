/**
 * Provides database interaction for everything related to trip leaders.
 * 
 * @author Colin Hermack
 */

import TripLeaderDTO from "@/dtos/tripLeaderDto";

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
 * Gets a list of all trip leaders
 * 
 * @returns A promise that resolves to a list of trip leader DTOs
 */
export async function getAllTripLeaders(): Promise<TripLeaderDTO[]> {
    let result: typeof QueryResult = null;
    const client = await pool.connect();
}

