/**
 * API Endpoint which allows certain authenticated officers to add new trips to the database.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const { Pool, QueryResult } = require("pg"); //PostgreSQL
const officersAllowed = ["Data Analyst", "Webmaster", "President", "Vice President"];

interface IUpdateRosterProps {
    tripId: number;
    tripLeaders: string[];
    tripMembers: string[];
}

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

async function verifyUserIsAuthorized(email: string): Promise<boolean> {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM member WHERE email = $1;", [email]);
        if (result === null || result.rows.length === 0) {
            return false;
        } else {
            return officersAllowed.includes(result.rows[0].role);
        }
    } catch (error: any) {
        return false;
    } finally {
        client.release();
    }
}

async function updateTrip(props: IUpdateRosterProps): Promise<boolean> {
    const client = await pool.connect();
    let result: typeof QueryResult = null;

    try {
        for (let i = 0; i < props.tripLeaders.length; i++) {
            result = await client.query("SELECT member_id FROM member WHERE email = $1;", [props.tripLeaders[i]]);
            if (result === null || result.rows.length === 0) {
                return false;
            } else {
                await client.query("INSERT INTO trip_roster (trip_id, member_id, is_leader) VALUES ($1, $2, true);", [props.tripId, result.rows[0].member_id]);
            }
        }

        for (let i = 0; i < props.tripMembers.length; i++) {
            result = await client.query("SELECT member_id FROM member WHERE email = $1;", [props.tripMembers[i]]);
            if (result === null || result.rows.length === 0) {
                return false;
            } else {
                await client.query("INSERT INTO trip_roster (trip_id, member_id, is_leader) VALUES ($1, $2, false);", [props.tripId, result.rows[0].member_id]);
            }
        }
    } catch (error: any) {
        return false;
    } finally {
        client.release();
    }

    return false;
}

export async function POST(request: Request) {
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

    const isAuthorized: boolean = await verifyUserIsAuthorized(session.user.email);

    if (!isAuthorized) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (typeof body === "object") {
        if (
            typeof body.tripId !== "number" ||
            typeof body.tripLeaders !== "object" ||
            typeof body.tripMembers !== "object"
        ) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const didUpdateRoster: boolean = await updateTrip(body);

        if (didUpdateRoster) {
            return NextResponse.json({message: "Roster Updated"}, { status: 200 });
        } else {
            return NextResponse.json({ error: "Trip could not be added" }, { status: 500 });
        }
    }
}