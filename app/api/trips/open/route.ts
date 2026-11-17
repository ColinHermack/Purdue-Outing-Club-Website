/**
 * Serves a JSON string containing the open trips.
 *
 * @author Colin Hermack
 */

// Opt out of build-time caching so every request reads the database. Older Next.js versions cached GET handlers by
// default, which served stale data; keep these so a framework change can't bring that back.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getOpenTrips } from "@/miniservices/tripMiniService";

/**
 * The actual route handler.
 *
 * @returns An HTTPS response object.
 */
export async function GET() {
  const openTrips = await getOpenTrips();

  return new Response(JSON.stringify(openTrips), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
