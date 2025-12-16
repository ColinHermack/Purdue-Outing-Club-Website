/**
 * Serves an array of JSON strings containing the name and hours of each gear officer.
 *
 * @author Colin Hermack
 */

import { GearOfficerDataType, GearHoursDataType } from '@/utils/types';
import { getAllGearHours } from '@/services/gearservice';

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpointl

/**
 * GET /api/gear/hours
 *
 * Retrieves the hours for all gear officers.
 *
 * @returns An array of JSON objects containing the name and hours of each gear officer.
 */
export async function GET() {
  let gearHours: GearOfficerDataType[] | null = await getAllGearHours(); // Get an array of gear officer data

  if (gearHours === null) {
    return new Response(
      JSON.stringify({ errorMessage: "Internal server error" }),
      {status: 500}
    );
  }

  let cleanedHours: GearHoursDataType[] = gearHours.map((officer) => {
    return {
      name: officer.name,
      hours: officer.officerData.gearHours,
    };
  }); // Map over the array and extract only the data we want to send to the client

  return new Response(JSON.stringify(cleanedHours), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  }); // Send a response to the client with code 200 OK
}
