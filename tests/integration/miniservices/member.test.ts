import { describe, expect, it } from "vitest";

import {
  getMemberByEmail,
  getMemberById,
  getMemberDirectory,
  getMembers,
  getMostTripsAttended,
  getMostTripsLed,
  verifyMembershipByEmail,
} from "@/miniservices/memberMiniService";

describe("memberMiniService against the test DB", () => {
  it("getMembers returns every row, json columns parsed", async () => {
    const members = await getMembers();
    const alice = members.find((m) => m.email === "alice@purdue.edu");

    expect(members).toHaveLength(7);
    expect(alice).toMatchObject({
      id: 1,
      name: "Alice Anderson",
      carData: { Model: "Subaru Outback", Capacity: "5", Hitch: true },
      policyAgreement: true,
    });
  });

  it("the trip_roster triggers keep trip_count in sync", async () => {
    expect((await getMemberById(2))?.tripCount).toBe(3);
    expect((await getMemberById(6))?.tripCount).toBe(0);
  });

  describe("getMemberDirectory", () => {
    it("excludes the service account and sorts by name", async () => {
      const names = (await getMemberDirectory()).map((m) => m.name);

      expect(names).toEqual([
        "Alice Anderson",
        "Bob Brown",
        "Carol Clark",
        "Dave Davis",
        "Erin Evans",
        "Frank Fisher",
      ]);
    });

    it("derives status fields in SQL", async () => {
      const byEmail = Object.fromEntries(
        (await getMemberDirectory()).map((m) => [m.email, m]),
      );

      expect(byEmail["alice@purdue.edu"]).toMatchObject({
        isActive: true,
        duesStatus: "paid",
        firstAidType: "WFA",
        carCapacity: "5",
        carHitch: true,
        driverCertified: true,
      });
      // Expired dues, first aid and license; car without a hitch.
      expect(byEmail["bob@purdue.edu"]).toMatchObject({
        isActive: false,
        duesStatus: "expired",
        firstAidType: null,
        carCapacity: "4",
        carHitch: false,
        driverCertified: false,
      });
      // Every nullable column null: coalesced to false / 'none'.
      expect(byEmail["carol@purdue.edu"]).toMatchObject({
        isActive: false,
        duesStatus: "none",
        policyAgreement: false,
        waiverAgreement: false,
        phone: null,
        firstAidType: null,
        carCapacity: null,
        carHitch: false,
        driverCertified: false,
      });
      // Paid and signed, but a hold blocks active status.
      expect(byEmail["dave@purdue.edu"]).toMatchObject({
        isActive: false,
        duesStatus: "paid",
      });
    });
  });

  it.each([
    ["alice@purdue.edu", true],
    ["stranger@purdue.edu", false],
  ])("verifyMembershipByEmail(%s) is %s", async (email, expected) => {
    expect(await verifyMembershipByEmail(email)).toBe(expected);
  });

  it("looks members up by email and id", async () => {
    expect((await getMemberByEmail("carol@purdue.edu"))?.id).toBe(3);
    expect(await getMemberByEmail("stranger@purdue.edu")).toBeNull();
    expect((await getMemberById(3))?.email).toBe("carol@purdue.edu");
    expect(await getMemberById(999)).toBeNull();
  });

  it("ranks the leaderboards", async () => {
    // COUNT(*) is a bigint, which pg returns as a string.
    const led = (await getMostTripsLed()).map((r) => [
      r.member.name,
      Number(r.tripsLed),
    ]);
    const attended = (await getMostTripsAttended()).map((r) => [
      r.member.name,
      Number(r.tripsAttended),
    ]);

    expect(led.slice(0, 2)).toEqual([
      ["Alice Anderson", 2],
      ["Carol Clark", 1],
    ]);
    // Alice and Erin tie at 2, and the query has no tiebreaker, so their order is unspecified.
    expect(attended).toHaveLength(4);
    expect(attended[0]).toEqual(["Bob Brown", 3]);
    expect(attended.slice(1, 3)).toEqual(
      expect.arrayContaining([
        ["Alice Anderson", 2],
        ["Erin Evans", 2],
      ]),
    );
    expect(attended[3]).toEqual(["Carol Clark", 1]);
  });
});
