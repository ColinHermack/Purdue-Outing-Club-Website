"use server";

/**
 * A protected API endpoint for the signed-in user's car, edited from the dashboard's My car card.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  removeCarByEmail,
  updateCarByEmail,
} from "@/miniservices/memberMiniService";
import { canSignIn, getMemberAccess } from "@/utils/memberAccess";
import { parseCar } from "@/utils/memberForms";

/**
 * Returns the session email when the caller may use the dashboard, or the error response to send instead.
 */
async function signedInEmail(): Promise<string | Response> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    session.user === undefined ||
    typeof session.user.email !== "string"
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!canSignIn(await getMemberAccess(session.user.email))) {
    return new Response("Forbidden", { status: 403 });
  }

  return session.user.email;
}

/**
 * Adds or replaces the signed-in user's car.
 *
 * @returns The saved car as JSON.
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const email = await signedInEmail();

    if (email instanceof Response) return email;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid request body", { status: 400 });
    }

    const parsed = parseCar(body);

    if (!parsed.ok) {
      return new Response(Object.values(parsed.errors).join(" "), {
        status: 400,
      });
    }

    const car = await updateCarByEmail(email, parsed.value);

    if (car === null) {
      return new Response(`No club member exists with email ${email}.`, {
        status: 404,
      });
    }

    return new Response(JSON.stringify(car), { status: 200 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Removes the signed-in user's car.
 *
 * @returns 204 on success.
 */
export async function DELETE(): Promise<Response> {
  try {
    const email = await signedInEmail();

    if (email instanceof Response) return email;

    if (!(await removeCarByEmail(email))) {
      return new Response(`No club member exists with email ${email}.`, {
        status: 404,
      });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
