"use server";

/**
 * A protected API route that will allow authorized users to get a list of trip leaders, add a new trip leader, or
 * update an existing trip leader.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import OfficerDTO from "@/dtos/officerDto";
import TripLeaderDTO from "@/dtos/tripLeaderDto";
import MemberDTO from "@/dtos/memberDto";
import CreateTripLeaderDTO from "@/dtos/createTripLeaderDto";
import UpdateTripLeaderDTO from "@/dtos/updateTripLeaderDto";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import {
  getAllTripLeaders,
  createTripLeader,
  getTripLeader,
  updateTripLeader,
} from "@/miniservices/tripLeaderMiniService";
import { getMemberById } from "@/miniservices/memberMiniService";

import { GET_TRIP_LEADERS_AUTHORIZED_POSITIONS } from "@/config/permissions";

/**
 * Gets a list of JSON strings representing trip leaders.
 *
 * @returns An HTTP response object
 */
export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userOfficerPositions: OfficerDTO[] | null =
      await getOfficerDataByEmail(session.user.email);

    if (userOfficerPositions === null) {
      return new Response("Forbidden", { status: 401 });
    }

    const userIsAuthorized: boolean = userOfficerPositions.some(
      (officer: OfficerDTO) =>
        officer.position !== undefined &&
        GET_TRIP_LEADERS_AUTHORIZED_POSITIONS.includes(officer.position),
    );

    if (!userIsAuthorized) {
      return new Response("Forbidden", { status: 401 });
    }

    const tripLeaders: TripLeaderDTO[] = await getAllTripLeaders();
    return new Response(JSON.stringify(tripLeaders), { status: 200 });
  } catch (error: any) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Creates a new trip leader in the trip leaders table.
 *
 * @returns An HTTP response object
 */
export async function POST(
  newTripLeader: CreateTripLeaderDTO,
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userOfficerPositions: OfficerDTO[] | null =
      await getOfficerDataByEmail(session.user.email);

    if (userOfficerPositions === null) {
      return new Response("Forbidden", { status: 401 });
    }

    const userIsAuthorized: boolean = userOfficerPositions.some(
      (officer: OfficerDTO) =>
        officer.position !== undefined &&
        GET_TRIP_LEADERS_AUTHORIZED_POSITIONS.includes(officer.position),
    );

    if (!userIsAuthorized) {
      return new Response("Forbidden", { status: 401 });
    }

    if (newTripLeader.memberId == null) {
      return new Response("Field memberId is required", { status: 400 });
    }

    const member: MemberDTO | null = await getMemberById(
      newTripLeader.memberId,
    );
    if (member == null) {
      return new Response(
        `No member with id ${newTripLeader.memberId} exists.`,
      );
    }

    const didCreateTripLeader: boolean = await createTripLeader(newTripLeader);
    if (!didCreateTripLeader) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const createdTripLeader: TripLeaderDTO = await getTripLeader(
      newTripLeader.memberId,
    );
    return new Response(JSON.stringify(createdTripLeader), { status: 200 });
  } catch (error: any) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Updates an existing trip leader in the trip leaders table.
 *
 * @returns An HTTP response object
 */
export async function PUT(
  updatedTripLeader: UpdateTripLeaderDTO,
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userOfficerPositions: OfficerDTO[] | null =
      await getOfficerDataByEmail(session.user.email);

    if (userOfficerPositions === null) {
      return new Response("Forbidden", { status: 401 });
    }

    const userIsAuthorized: boolean = userOfficerPositions.some(
      (officer: OfficerDTO) =>
        officer.position !== undefined &&
        GET_TRIP_LEADERS_AUTHORIZED_POSITIONS.includes(officer.position),
    );

    if (!userIsAuthorized) {
      return new Response("Forbidden", { status: 401 });
    }

    if (updatedTripLeader.memberId == null) {
      return new Response("Field memberId is required", { status: 400 });
    }

    const member: MemberDTO | null = await getMemberById(
      updatedTripLeader.memberId,
    );
    if (member == null) {
      return new Response(
        `No member with id ${updatedTripLeader.memberId} exists.`,
      );
    }

    const didUpdateTripLeader: boolean =
      await updateTripLeader(updatedTripLeader);
    if (!didUpdateTripLeader) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const tripLeader: TripLeaderDTO = await getTripLeader(
      updatedTripLeader.memberId,
    );
    return new Response(JSON.stringify(tripLeader), { status: 200 });
  } catch (error: any) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
