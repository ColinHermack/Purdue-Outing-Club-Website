/**
 * This route is only used to check if the API is online, and has no other purpose.
 *
 * @author Colin Hermack
 */

import { NextResponse } from "next/server";

/**
 * Simple route to check if the API is online.
 *
 * @returns a 200 OK response with the body "API is online."
 */
export async function GET() {
  return new NextResponse("API is online.", { status: 200 });
}
