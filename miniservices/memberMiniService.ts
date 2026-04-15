/**
 * Handles all database communication related to members generally.
 * 
 * @author Colin Hermack
 */

"use server"

const { Pool, QueryResult } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
})

/**
 * Checks whether a user exists in the database
 * @param email The user's email address
 * @returns A promise resolving to true if they exist, false otherwise
 */
export async function verifyMembershipByEmail(email: string): Promise<boolean> {
    const client = await pool.connect();

    try {
        let result = await client.query("SELECT * FROM member WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            return true;
        }
    } catch (error: any) {
        throw error;
    } finally {
        client.release();
    }
    return false;
}