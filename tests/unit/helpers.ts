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
