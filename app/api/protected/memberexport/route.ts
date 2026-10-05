"use server";

/**
 * A protected API route that lets authorized officers download every member's name and email as a CSV file.
 *
 * @author Colin Hermack
 */

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import OfficerDTO from "@/dtos/officerDto";
import MemberDTO from "@/dtos/memberDto";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import { getMembers } from "@/miniservices/memberMiniService";

import { EXPORT_MEMBERS_AUTHORIZED_POSITIONS } from "@/config/permissions";

/**
 * Formats a value as a quoted CSV cell. Values starting with a formula character get a leading apostrophe so
 * spreadsheet apps show them as text instead of running them, since names are entered by members.
 *
 * @param value The raw cell value
 * @returns The escaped cell
 */
function csvCell(value: string | undefined): string {
  let cell = value ?? "";

  if (/^[=+\-@\t\r]/.test(cell)) {
    cell = `'${cell}`;
  }

  return `"${cell.replaceAll('"', '""')}"`;
}

/**
 * Returns a CSV attachment with the name and email of every member, sorted by name.
 *
 * @returns An HTTP response object
 */
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

    const userOfficerPositions: OfficerDTO[] | null =
      await getOfficerDataByEmail(session.user.email);

    if (userOfficerPositions === null) {
      return new Response("Forbidden", { status: 401 });
    }

    const userIsAuthorized: boolean = userOfficerPositions.some(
      (officer: OfficerDTO) =>
        officer.position !== undefined &&
        EXPORT_MEMBERS_AUTHORIZED_POSITIONS.includes(officer.position),
    );

    if (!userIsAuthorized) {
      return new Response("Forbidden", { status: 401 });
    }

    const members: MemberDTO[] = await getMembers();
    members.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    const rows: string[] = [
      "Name,Email",
      ...members.map(
        (member) => `${csvCell(member.name)},${csvCell(member.email)}`,
      ),
    ];
    const date: string = new Date().toISOString().slice(0, 10);

    return new Response(rows.join("\r\n") + "\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="members-${date}.csv"`,
      },
    });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
