"use server";

/**
 * An API endpoint used to handle information for the currently signed in user.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import MemberDTO from "@/dtos/memberDto";
import { getMemberByEmail } from "@/miniservices/memberMiniService";

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

    const email: string = session.user.email;
    const member: MemberDTO | null = await getMemberByEmail(email);

    if (member == null) {
      return new Response(`No club member exists with email ${email}.`, {
        status: 404,
      });
    }

    return new Response(JSON.stringify(member), { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
