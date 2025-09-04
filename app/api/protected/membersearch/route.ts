/**
 * A protected API endpoint which will return a JSON string containing a member's trip statistics, but only if they
 * are a member of the club.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { MemberStatsT, TripInfoT } from "@/utils/types";

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
}); // Initialize pool of database connections

const AUTHORIZED_POSITIONS = ["President", "Vice President", "Secretary of Operations", "Data Analyst", "Webmaster"]

async function verifyUserIsAuthorized(email: string): Promise<boolean> {
    let result: typeof QueryResult = null;
    const client = await pool.connect();

    try {
        result = await client.query("SELECT * FROM member WHERE email = $1;", [email]);
        if (result === null || result.rows.length === 0) {
            return false;
        } else {
            return AUTHORIZED_POSITIONS.includes(result.rows[0].role);
        }
    } catch (error: any) {
        return false;
    } finally {
        client.release();
    }
}

async function getMatchingEmails(name: string): Promise<string[]> {
    let result: typeof QueryResult = null;
    const client = await pool.connect();

    try {
        result = await client.query("SELECT email FROM member WHERE name LIKE '%$1%';", [name]);
        if (result === null || result.rows.length === 0) {
            return [];
        } else {
            return result.rows.map((row: any) => row.email);
        }
    } catch (error: any) {
        return [];
    } finally {
        client.release();
    }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user === undefined) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (typeof session.user.email !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  verifyUserIsAuthorized(session.user.email).then((isAuthorized) => {
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  })

  const body = await request.json();
  if (typeof body === "object") {
    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const matchingEmails: string[] = await getMatchingEmails(body.name);
  return NextResponse.json({ emails: matchingEmails }, { status: 200 });
}
