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

interface IUpdateTripProps {
    tripName: string;
    startDate: string;  // In UTC
    endDate: string;  // In UTC
    category: string;
    sport: string;
    location: string;
    description: string;
    difficulty: number;
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

async function updateTrip(props: IUpdateTripProps): Promise<boolean> {
    const client = await pool.connect();
    let idResult: typeof QueryResult;
    let highestResult: number;

    try {
        idResult = await client.query("SELECT trip_id FROM trip ORDER BY trip_id DESC LIMIT 1;");
        if (idResult === null || idResult.rows.length === 0) {
            return false;
        } else {
            highestResult = idResult.rows[0].trip_id;
        }
    } catch (error: any) {
        return false;
    } finally {
        client.release();
    }

    try {
        await client.query(
            "INSERT INTO trip (trip_id, trip_name, start_date, end_date, category, sport, location, description, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);",
            [
                highestResult + 1,
                props.tripName,
                props.startDate,
                props.endDate,
                props.category,
                props.sport,
                props.location,
                props.description,
                props.difficulty,
            ],
        );
        return true;
    } catch (error: any) {
        return false;
    } finally {
        client.release();
    }
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
            typeof body.tripName !== "string" ||
            typeof body.startDate !== "string" ||
            typeof body.endDate !== "string" ||
            typeof body.category !== "string" ||
            typeof body.sport !== "string" ||
            typeof body.location !== "string" ||
            typeof body.description !== "string" ||
            typeof body.difficulty !== "number"
        ) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const wasTripAdded: boolean = await updateTrip(body);

        if (wasTripAdded) {
            return NextResponse.json({ message: "Trip added successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Trip could not be added" }, { status: 500 });
        }
    }
}