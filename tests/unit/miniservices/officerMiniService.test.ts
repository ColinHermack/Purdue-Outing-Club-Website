import { beforeEach, describe, expect, it, vi } from "vitest";

import { memberRow, pgClient, queryReturns } from "../helpers";

import {
  getGearHours,
  getLeaderData,
  getLeaderDataByPosition,
  getOfficerDataByEmail,
  verifyMemberIsOfficer,
} from "@/miniservices/officerMiniService";

vi.mock("pg", async () => (await import("../helpers")).pgModule);

const leaderRow = (position: string) => ({
  position,
  officerData: { ImagePath: "x.png" },
  name: "Someone",
  email: "someone@purdue.edu",
  pronouns: "they/them",
  phone: "765-555-0000",
});

describe("officerMiniService", () => {
  beforeEach(() => {
    pgClient.query.mockResolvedValue({ rows: [] });
  });

  it("getOfficerDataByEmail maps each officer position to an OfficerDTO", async () => {
    queryReturns([
      {
        ...memberRow(),
        position: "Webmaster",
        year: 2026,
        officer_data: { ImagePath: "a.png" },
      },
      { ...memberRow(), position: "Treasurer", year: 2026, officer_data: null },
    ]);

    const officers = await getOfficerDataByEmail("alice@purdue.edu");

    expect(officers).toHaveLength(2);
    expect(officers?.[0]).toMatchObject({
      position: "Webmaster",
      year: 2026,
      officerData: { ImagePath: "a.png" },
      member: { id: 1, email: "alice@purdue.edu", schoolYear: "Senior" },
    });
    expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), [
      "alice@purdue.edu",
    ]);
  });

  it("getOfficerDataByEmail returns null for a non-officer", async () => {
    expect(await getOfficerDataByEmail("bob@purdue.edu")).toBeNull();
  });

  it("getLeaderData groups officers into their branch and drops unknown positions", async () => {
    queryReturns([
      leaderRow("President"),
      leaderRow("Webmaster"),
      leaderRow("Made Up Role"),
    ]);

    const branches = await getLeaderData();
    const byLabel = Object.fromEntries(
      branches.map((b) => [b.label, b.content]),
    );

    expect(byLabel.Executive.map((o) => o.position)).toEqual(["President"]);
    expect(byLabel.Operations.map((o) => o.position)).toEqual(["Webmaster"]);
    expect(branches.flatMap((b) => b.content)).toHaveLength(2);
  });

  it("getLeaderDataByPosition returns the first match or undefined", async () => {
    queryReturns([leaderRow("President")]);

    expect(await getLeaderDataByPosition("President")).toMatchObject({
      position: "President",
    });
    expect(await getLeaderDataByPosition("Nobody")).toBeUndefined();
  });

  it("getGearHours returns rows as-is", async () => {
    const rows = [
      { name: "Erin", gearhours: [{ day: "Monday", time: "5-7pm" }] },
    ];

    queryReturns(rows);

    expect(await getGearHours()).toEqual(rows);
  });

  it.each([
    [[{ member_id: 1 }], true],
    [[], false],
  ])(
    "verifyMemberIsOfficer with rows %j returns %s",
    async (rows, expected) => {
      queryReturns(rows);

      expect(await verifyMemberIsOfficer(1)).toBe(expected);
      expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), [1]);
    },
  );

  it("releases the client when the query throws", async () => {
    pgClient.query.mockRejectedValueOnce(new Error("boom"));

    await expect(getOfficerDataByEmail("a@purdue.edu")).rejects.toThrow("boom");
    expect(pgClient.release).toHaveBeenCalledTimes(1);
  });
});
