import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { NextApiRequest } from 'next'

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { getNameMatches } from '@/utils/members';

export async function GET(req: NextApiRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchTerm = req.url?.split('?')[1]?.split('=')[1].replaceAll('+', ' ');

  if (!searchTerm) {
    return NextResponse.json({ error: "No search term provided" }, { status: 400 });
  }

  const matches = await getNameMatches(searchTerm);

  return NextResponse.json(matches);
}