/**
 * Machine-only API route, called by the treasurer's Power Automate flow, that records a dues
 * payment from a TooCool receipt PDF.
 *
 * Authenticated only by the DUES_API_KEY bearer token. NextAuth sessions are deliberately not
 * accepted, so a signed-in member cannot call it. Keep this route out of the `proxy.ts` matcher,
 * which would redirect the flow to the sign-in page.
 *
 * @author Colin Hermack
 */

import { createHash, timingSafeEqual } from "node:crypto";

import { NextRequest } from "next/server";

import { recordDuesByEmail } from "@/miniservices/memberMiniService";
import { duesExpiration, readReceipt, ReceiptKind } from "@/utils/duesReceipt";

/** The `dues_data.Type` stored for each kind of dues receipt. */
const DUES_TYPES = {
  annual: "Annual",
  fall: "Fall",
  spring: "Spring",
} as const;

/**
 * Checks the request's bearer token against DUES_API_KEY in constant time. Fails closed when the
 * key is unset or too short to be a real secret.
 */
function hasValidApiKey(request: NextRequest): boolean {
  const expected = process.env.DUES_API_KEY;
  const header = request.headers.get("authorization");

  if (!expected || expected.length < 32 || !header?.startsWith("Bearer ")) {
    return false;
  }

  const sha256 = (value: string) =>
    new Uint8Array(createHash("sha256").update(value).digest());

  return timingSafeEqual(
    sha256(header.slice("Bearer ".length)),
    sha256(expected),
  );
}

/**
 * Classifies a receipt and updates the member's dues.
 *
 * Body: `{ "email": string, "receipt": string }` where `receipt` is the base64-encoded PDF.
 *
 * Creates the member, named from the receipt, when no member has that email.
 *
 * @returns 200 `{ email, type, expires, created }` for an existing member, 201 for a new one, 400
 * for a malformed request, 401 for a bad key, 422 when the receipt is not for club dues.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!hasValidApiKey(request)) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: { email?: unknown; receipt?: unknown };

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid request body", { status: 400 });
    }

    const { email, receipt } = body ?? {};

    if (typeof email !== "string" || email.trim() === "") {
      return new Response("Field email is required", { status: 400 });
    }

    if (typeof receipt !== "string" || receipt === "") {
      return new Response("Field receipt is required", { status: 400 });
    }

    const pdf = Buffer.from(receipt, "base64");

    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return new Response("Field receipt must be a base64-encoded PDF", {
        status: 400,
      });
    }

    let kind: ReceiptKind;
    let name: string | null;

    try {
      ({ kind, name } = await readReceipt(new Uint8Array(pdf)));
    } catch {
      return new Response("Could not read the receipt PDF", { status: 400 });
    }

    if (kind === "other") {
      return new Response("Not a club dues receipt", { status: 422 });
    }

    const memberEmail = email.trim();
    // A receipt whose name can't be read still creates the member; an officer can fix the name.
    const { expires, created } = await recordDuesByEmail(
      memberEmail,
      name ?? memberEmail.split("@")[0],
      DUES_TYPES[kind],
      duesExpiration(kind),
    );

    return Response.json(
      { email: memberEmail, type: kind, expires, created },
      { status: created ? 201 : 200 },
    );
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
