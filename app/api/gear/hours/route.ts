/**
 * Serves an array of JSON strings containing the name and hours of each gear officer.
 *
 * @author Colin Hermack
 */

import { GearHoursDataT } from "@/config/types";
import { getGearHours } from "@/miniservices/officerMiniService";

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpoint

/**
 * GET /api/gear/hours
 *
 * Retrieves the hours for all gear officers.
 *
 * @returns An array of JSON objects containing the name and hours of each gear officer.
 */
export async function GET() {
  let gearHours: GearHoursDataT[];
  try {
    gearHours = await getGearHours(); // Get an array of gear officer data
  } catch {
    return new Response("Error getting gear hours", { status: 500 });
  }

  return new Response(JSON.stringify(gearHours), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
