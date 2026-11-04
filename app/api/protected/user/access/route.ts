"use server";

/**
 * A protected API endpoint that tells the signed-in user which club tools their roles unlock. Used by the navbar
 * account menu.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { canSignIn, getMemberAccess } from "@/utils/memberAccess";

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const access = await getMemberAccess(session.user.email);

    if (!canSignIn(access)) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response(
      JSON.stringify({
        name: access.name,
        email: session.user.email,
        tools: access.tools,
      }),
      { status: 200 },
    );
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
