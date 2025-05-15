/**
 * API Endpoint which uses next-auth to get the user's session and then queries the database to determine if they are a
 * member of the club.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

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
}); // Initialize a new pool of database connections.

/**
 * Verifies that the user's email is in the database.
 *
 * @param email The user's Purdue/Microsoft SSO email address
 * @returns A promise that resolves to true if the user is a member of the club, false otherwise
 */
async function verifyMember(email: string): Promise<boolean> {
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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let isMember = false;

  if (session.user !== undefined && typeof session.user.email === "string") {
    isMember = await verifyMember(session.user.email);
  }

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    return NextResponse.json({
      message: "Membership verified",
      user: session.user === undefined ? "" : session.user.email,
    });
  }
}
