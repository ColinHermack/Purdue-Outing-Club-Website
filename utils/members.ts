/**
 * Utilities related to fetching membership data from the database.
 * @author Colin Hermack
 */

"use server";

export interface IMember {
    name: string;
    email: string;
}

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

/**
 * Verifies that the user's email is in the database.
 *
 * @param email The user's Purdue/Microsoft SSO email address
 * @returns A promise that resolves to true if the user is a member of the club, false otherwise
 */
export async function verifyMember(email: string): Promise<boolean> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query("SELECT * FROM member WHERE email = $1;", [
      email,
    ]);
    if (result === null || result.rows.length === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error: any) {
    return false;
  } finally {
    client.release();
  }
}

export async function getNameMatches(search: string): Promise<IMember[]> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  search = `%${search}%`;

  try {
    result = await client.query("SELECT * FROM member WHERE name ILIKE $1;", [
      search,
    ]);
    if (result === null || result.rows.length === 0) {
        return [];
    } else {
      return result.rows.map((item: any) => {
        return {
            name: item.name,
            email: item.email
        }
      })
    }
  } catch (error: any) {
    return [];
  } finally {
    client.release();
  }
}