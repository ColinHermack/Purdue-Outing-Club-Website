import { beforeEach, describe, expect, it, vi } from "vitest";

import { memberRow, pgClient, queryReturns } from "../helpers";

import {
  getMemberByEmail,
  getMemberById,
  getMemberDirectory,
  getMembers,
  getMostTripsAttended,
  getMostTripsLed,
  verifyMembershipByEmail,
} from "@/miniservices/memberMiniService";

vi.mock("pg", async () => (await import("../helpers")).pgModule);

describe("memberMiniService", () => {
  beforeEach(() => {
    pgClient.query.mockResolvedValue({ rows: [] });
  });

  it("maps member rows from snake_case to camelCase", async () => {
    const row = memberRow();

    queryReturns([row]);

    expect(await getMembers()).toEqual([
      {
        id: row.member_id,
        name: row.name,
        pronouns: row.pronouns,
        email: row.email,
        phone: row.phone,
        duesData: row.dues_data,
        firstAidData: row.first_aid_data,
        carData: row.car_data,
        driverData: row.driver_data,
        emergencyData: row.emergency_data,
        policyAgreement: row.policy_agreement,
        waiverAgreement: row.waiver_agreement,
        schoolYear: row.school_year,
        medicalData: row.medical_data,
        tripCount: row.trip_count,
        holds: row.holds,
        signupCount: row.signup_count,
        yearsActive: row.years_active,
        campus: row.campus,
      },
    ]);
  });

  it("maps member directory rows", async () => {
    queryReturns([
      {
        member_id: 1,
        name: "Alice",
        pronouns: "she/her",
        email: "alice@purdue.edu",
        phone: null,
        is_active: true,
        policy_agreement: true,
        waiver_agreement: false,
        dues_status: "paid",
        first_aid_type: "WFA",
        car_capacity: "5",
        car_hitch: true,
        driver_certified: false,
      },
    ]);

    expect(await getMemberDirectory()).toEqual([
      {
        id: 1,
        name: "Alice",
        pronouns: "she/her",
        email: "alice@purdue.edu",
        phone: null,
        isActive: true,
        policyAgreement: true,
        waiverAgreement: false,
        duesStatus: "paid",
        firstAidType: "WFA",
        carCapacity: "5",
        carHitch: true,
        driverCertified: false,
      },
    ]);
  });

  it.each([
    [[memberRow()], true],
    [[], false],
  ])(
    "verifyMembershipByEmail with rows %j returns %s",
    async (rows, expected) => {
      queryReturns(rows);

      expect(await verifyMembershipByEmail("alice@purdue.edu")).toBe(expected);
      expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), [
        "alice@purdue.edu",
      ]);
    },
  );

  it("passes lookups as query parameters, never in the SQL text", async () => {
    const email = "x'; DROP TABLE member; --";

    await getMemberByEmail(email);
    await getMemberById(42);

    expect(pgClient.query.mock.calls[0][0]).not.toContain(email);
    expect(pgClient.query.mock.calls[0][1]).toEqual([email]);
    expect(pgClient.query.mock.calls[1][1]).toEqual([42]);
  });

  it.each([
    ["getMemberById", () => getMemberById(99)],
    ["getMemberByEmail", () => getMemberByEmail("nobody@purdue.edu")],
  ])("%s returns null when no row matches", async (_, lookup) => {
    expect(await lookup()).toBeNull();
  });

  it("getMemberById returns the mapped member", async () => {
    queryReturns([memberRow({ member_id: 7 })]);

    expect(await getMemberById(7)).toMatchObject({
      id: 7,
      name: "Alice Anderson",
    });
  });

  it("maps the leaderboards", async () => {
    queryReturns([{ ...memberRow(), trips_led: "4" }]);
    queryReturns([{ ...memberRow(), trips_attended: "9" }]);

    expect(await getMostTripsLed()).toEqual([
      { tripsLed: "4", member: expect.objectContaining({ id: 1 }) },
    ]);
    expect(await getMostTripsAttended()).toEqual([
      { tripsAttended: "9", member: expect.objectContaining({ id: 1 }) },
    ]);
  });

  it("releases the client when the query throws", async () => {
    pgClient.query.mockRejectedValueOnce(new Error("connection lost"));

    await expect(getMembers()).rejects.toThrow("connection lost");
    expect(pgClient.release).toHaveBeenCalledTimes(1);
  });
});
