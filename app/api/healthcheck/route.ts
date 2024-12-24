// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("API is online.", { status: 200 });
}
