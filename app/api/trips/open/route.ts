/**
 * Serves a JSON string containing the open trips.
 *
 * @author Colin Hermack
 */

export const dynamic = "force-dynamic"; // Stops NextJS from overoptimizing and breaking this endpoint
export const revalidate = 0; // Stops NextJS from overoptimizing and breaking this endpoint

import { getOpenTrips } from "@/miniservices/tripMiniService";

/**
 * The actual route handler.
 *
 * @returns An HTTPS response object.
 */
export async function GET() {
  let openTrips = await getOpenTrips();

  return new Response(JSON.stringify(openTrips), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
