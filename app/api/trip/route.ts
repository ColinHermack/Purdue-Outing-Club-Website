/**
 * Serves a JSON string containing the open trips.
 *
 * @author Colin Hermack
 */

import { NextRequest } from 'next/server';

const { Pool, QueryResult } = require("pg"); //PostgreSQL

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpoint

interface ITripLeader {
    name: string;
    email: string;
}

type TripData = {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    category: string;
    sport: string;
    location: string;
    description: string;
    difficulty: number;
    signup: boolean;
    leaders: ITripLeader[];
    roster: string[];
};

// Create a new pool of database connections
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
 * Query the database to get trip data for a single trip
 * @param id The trip id
 * @returns TripData type containing the needed trip data for display on website
 */
const getTripData = async (id: number): Promise<TripData | null> => {
    const client = await pool.connect();
    let retVal: TripData | null = null;

    try {
        let tripMetadata: typeof QueryResult = await client.query(
            `SELECT trip_id,
                name,
                startdate,
                enddate,
                category,
                sport,
                location,
                description,
                difficulty,
                signup 
            FROM trip 
            WHERE trip_id = $1;`,
            [id]
        );

        let tripLeaders: typeof QueryResult = await client.query(
            `SELECT m.name, m.email FROM trip_roster AS r
            JOIN member AS m ON m.member_id = r.member_id
            WHERE r.is_leader = true AND r.trip_id = $1;`,
            [id]
        );

        let tripRoster: typeof QueryResult = await client.query(
            `SELECT m.name FROM trip_roster as r
            JOIN member as m ON m.member_id = r.member_id
            WHERE r.is_leader = false and r.trip_id = $1;`,
            [id]
        );

        retVal = {
            id: id,
            name: tripMetadata.rows[0].name,
            startDate: new Date(tripMetadata.rows[0].startdate),
            endDate: new Date(tripMetadata.rows[0].enddate),
            category: tripMetadata.rows[0].category,
            sport: tripMetadata.rows[0].sport,
            location: tripMetadata.rows[0].location,
            description: tripMetadata.rows[0].description,
            difficulty: tripMetadata.rows[0].difficulty,
            signup: tripMetadata.rows[0].signup,
            leaders: tripLeaders.rows,
            roster: tripRoster.rows.map((row: {name: string}) => row.name)
        }
    } catch (error: any) {
        // console.error(error);
        return null;
    } finally {
        client.release();
    }

    return retVal;
}

/**
 * Responds to a user's GET request with the trip with the corresponding ID
 * @param request The HTTP request object
 * @returns An HTTP response object
 */
export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    let tripId: number = -1;

    if (id === null) {
        return new Response(
            JSON.stringify({errorMessage: "No trip id provided"}),
            {
                status: 400
            }
        )
    }

    try {
        tripId = parseInt(id);
    } catch (error: any) {
        return new Response(
            JSON.stringify({ errorMessage: "Trip id is in an invalid format"}),
            {
                status: 400
            }
        )
    }

    try {
        let tripData: TripData | null = await getTripData(tripId);
        if (tripData === null) {
            return new Response(
                JSON.stringify({ errorMessage: "Internal server error"}),
                {
                    status: 500
                }
            )
        }

        return new Response(JSON.stringify(tripData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            }
        })
    } catch (error: any) {
        return new Response(
            JSON.stringify({ errorMessage: "Internal server error"}),
            {
                status: 500
            }
        )
    }
    
}