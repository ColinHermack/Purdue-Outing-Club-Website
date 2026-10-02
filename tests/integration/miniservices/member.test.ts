import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connectTestDb, resetDb } from "../db";

import {
  getMemberByEmail,
  getMemberById,
  getMemberDirectory,
  getMembers,
  getMostTripsAttended,
  getMostTripsLed,
  recordDuesByEmail,
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

describe("recordDuesByEmail against the test DB", () => {
  beforeEach(async () => {
    await resetDb();
  });

  // Later files in the suite read the seed data without resetting.
  afterAll(async () => {
    await resetDb();
  });

  const membersWithEmail = async (email: string) =>
    (await getMembers()).filter((m) => m.email === email);

  it("sets dues for a member who never paid", async () => {
    expect(
      await recordDuesByEmail(
        "carol@purdue.edu",
        "Ignored",
        "Annual",
        "2099-08-31",
      ),
    ).toEqual({ expires: "2099-08-31", created: false });
    expect(await getMemberById(3)).toMatchObject({
      name: "Carol Clark",
      duesData: { Type: "Annual", Expires: "2099-08-31", Paid: true },
    });
  });

  it("replaces expired dues", async () => {
    await recordDuesByEmail("bob@purdue.edu", "Bob", "Fall", "2099-01-31");

    expect((await getMemberById(2))?.duesData).toEqual({
      Type: "Fall",
      Expires: "2099-01-31",
      Paid: true,
    });
  });

  it("keeps an existing later expiration", async () => {
    const before = (await getMemberById(1))?.duesData;
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    expect(
      await recordDuesByEmail("alice@purdue.edu", "Alice", "Spring", yesterday),
    ).toEqual({
      expires: (before as { Expires: string }).Expires,
      created: false,
    });
    expect((await getMemberById(1))?.duesData).toEqual(before);
  });

  it("matches email case-insensitively instead of creating a duplicate", async () => {
    expect(
      await recordDuesByEmail(
        "Carol@Purdue.EDU",
        "Carol",
        "Annual",
        "2099-08-31",
      ),
    ).toEqual({ expires: "2099-08-31", created: false });
    expect(await getMembers()).toHaveLength(7);
  });

  it("creates a member with dues for an unknown email", async () => {
    expect(
      await recordDuesByEmail(
        "New.Person@Purdue.edu",
        "New Person",
        "Annual",
        "2099-08-31",
      ),
    ).toEqual({ expires: "2099-08-31", created: true });

    const created = await getMemberByEmail("new.person@purdue.edu");

    expect(created).toMatchObject({
      name: "New Person",
      email: "new.person@purdue.edu",
      duesData: { Type: "Annual", Expires: "2099-08-31", Paid: true },
      tripCount: 0,
      signupCount: 0,
    });
    expect(await verifyMembershipByEmail("new.person@purdue.edu")).toBe(true);
  });

  it("creates a member even when member_id_seq is behind the existing ids", async () => {
    // Other tools insert members with explicit ids, leaving the sequence behind (as in dev).
    const db = await connectTestDb();

    try {
      await db.query("SELECT setval('member_id_seq', 1)");
    } finally {
      await db.end();
    }

    expect(
      await recordDuesByEmail(
        "late@purdue.edu",
        "Late Seq",
        "Annual",
        "2099-08-31",
      ),
    ).toEqual({ expires: "2099-08-31", created: true });
    expect((await getMemberByEmail("late@purdue.edu"))?.id).toBe(8);
  });

  it("waits for a concurrent payment for the same new email instead of creating a duplicate", async () => {
    // Play the other payment by hand: hold the email's lock with its new row not yet committed.
    const other = await connectTestDb();

    try {
      await other.query("BEGIN");
      await other.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        "racer@purdue.edu",
      ]);
      await other.query(
        "INSERT INTO member (name, email) VALUES ('Racer', 'racer@purdue.edu')",
      );

      const pending = recordDuesByEmail(
        "racer@purdue.edu",
        "Racer",
        "Fall",
        "2099-01-31",
      );

      // Without the lock the call would finish now, unable to see the uncommitted row, and insert.
      await new Promise((resolve) => setTimeout(resolve, 200));
      await other.query("COMMIT");

      expect(await pending).toEqual({ expires: "2099-01-31", created: false });
      expect(await membersWithEmail("racer@purdue.edu")).toHaveLength(1);
    } finally {
      await other.end();
    }
  });
});
