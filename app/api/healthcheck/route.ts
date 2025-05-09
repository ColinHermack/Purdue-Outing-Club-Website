/*
 * This route is only used to check if the API is online, and has no other purpose.
 * 
 * @author Colin Hermack
 */

import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("API is online.", { status: 200 });
}
