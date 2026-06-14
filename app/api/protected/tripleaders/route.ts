"use server";

/**
 * A protected API route that will allow authorized users to get a list of trip leaders or add a new trip leader. 
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import OfficerDTO from "@/dtos/officerDto";
import TripLeaderDTO from "@/dtos/tripLeaderDto";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import { getAllTripLeaders } from "@/miniservices/tripLeaderMiniService";

import { GET_TRIP_LEADERS_AUTHORIZED_POSITIONS } from "@/config/permissions";

/**
 * Gets a list of JSON strings representing trip leaders.
 * 
 * @returns An HTTP response object
 */
export async function GET(): Promise<Response> {
    const session = await getServerSession(authOptions);
    

    if (!session || session.user === undefined || typeof session.user.email !== "string") {
        return new Response("Unauthorized", {status: 401});
    }

    let userOfficerPositions: OfficerDTO[] | null = await getOfficerDataByEmail(session.user.email);

    if (userOfficerPositions === null) {
        return new Response("Forbidden", { status: 401 });
    }

    const userIsAuthorized: boolean = userOfficerPositions.some(
        (officer: OfficerDTO) => officer.position !== undefined && GET_TRIP_LEADERS_AUTHORIZED_POSITIONS.includes(officer.position)
    );

    if (!userIsAuthorized) {
        return new Response("Forbidden", { status: 401 });
    }

    const tripLeaders: TripLeaderDTO[] = await getAllTripLeaders();
    return new Response(JSON.stringify(tripLeaders), { status: 200 });
}