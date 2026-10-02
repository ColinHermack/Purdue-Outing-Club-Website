/**
 * Shared fakes for unit tests. Mock `pg` in a test file with:
 *
 *   vi.mock("pg", async () => (await import("../helpers")).pgModule);
 *
 * @author Colin Hermack
 */

import { NextRequest } from "next/server";
import { vi } from "vitest";

/** The client every mocked Pool hands out. Set `pgClient.query` results per test. */
export const pgClient = { query: vi.fn(), release: vi.fn() };

export const pgModule = {
  Pool: class {
    connect = async () => pgClient;
  },
};

/** Makes `pgClient.query` resolve with these rows once. */
export function queryReturns(rows: object[]) {
  pgClient.query.mockResolvedValueOnce({ rows });
}

/** A next-auth session for the given email. */
export function session(email: string | null = "alice@purdue.edu") {
  return { user: { email }, expires: "2099-01-01" };
}

export function jsonRequest(body: unknown, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    method,
    body: JSON.stringify(body),
  });
}

export function badJsonRequest(method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    method,
    body: "{not json",
  });
}

/** A full `member` row as the database returns it (snake_case). */
export function memberRow(overrides: object = {}) {
  return {
    member_id: 1,
    name: "Alice Anderson",
    pronouns: "she/her",
    email: "alice@purdue.edu",
    phone: "765-555-0001",
    dues_data: { Type: "Annual", Expires: "2099-01-01", Paid: true },
    first_aid_data: { Type: "WFA", Expires: "2099-01-01", Verified: true },
    car_data: { Model: "Outback", Capacity: "5", Hitch: true },
    driver_data: { License: "X123", State: "IN", Expires: "2099-01-01" },
    emergency_data: {
      Name: "Pat",
      Email: "pat@example.com",
      Phone: "765-555-1001",
      Relation: "Parent",
    },
    policy_agreement: true,
    waiver_agreement: true,
    school_year: "Senior",
    medical_data: {
      Allergies: "None",
      Conditions: "None",
      Medications: "None",
    },
    trip_count: 3,
    holds: null,
    signup_count: 3,
    years_active: "3",
    campus: "West Lafayette",
    ...overrides,
  };
}

/** A minimal one-page PDF with one line per argument, for exercising real PDF parsing. */
export function pdfWithText(...lines: string[]): Uint8Array {
  const stream = `BT /F1 12 Tf 14 TL 72 720 Td ${lines.map((l) => `(${l}) Tj T*`).join(" ")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;

    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;

    return offset;
  });
  const xref = pdf.length;

  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}
