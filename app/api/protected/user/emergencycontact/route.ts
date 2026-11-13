"use server";

/**
 * A protected API endpoint for the signed-in user's emergency contact, edited from the dashboard.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { updateEmergencyContactByEmail } from "@/miniservices/memberMiniService";
import { canSignIn, getMemberAccess } from "@/utils/memberAccess";
import { parseEmergencyContact } from "@/utils/memberForms";

/**
 * Adds or replaces the signed-in user's emergency contact.
 *
 * @returns The saved contact as JSON.
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user === undefined ||
      typeof session.user.email !== "string"
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const email: string = session.user.email;

    if (!canSignIn(await getMemberAccess(email))) {
      return new Response("Forbidden", { status: 403 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid request body", { status: 400 });
    }

    const parsed = parseEmergencyContact(body);

    if (!parsed.ok) {
      return new Response(Object.values(parsed.errors).join(" "), {
        status: 400,
      });
    }

    const contact = await updateEmergencyContactByEmail(email, parsed.value);

    if (contact === null) {
      return new Response(`No club member exists with email ${email}.`, {
        status: 404,
      });
    }

    return new Response(JSON.stringify(contact), { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
