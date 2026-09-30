import { describe, expect, it } from "vitest";

import {
  getGearHours,
  getLeaderData,
  getLeaderDataByPosition,
  getOfficerDataByEmail,
  verifyMemberIsOfficer,
} from "@/miniservices/officerMiniService";

describe("officerMiniService against the test DB", () => {
  it("getOfficerDataByEmail returns every position the member holds", async () => {
    const officers = await getOfficerDataByEmail("frank@purdue.edu");

    expect(officers?.map((o) => o.position).sort()).toEqual([
      "Diversity & Community Outreach",
      "Fundraising & Sponsorship",
      "Secretary of Outreach",
    ]);
    expect(officers?.[0].member).toMatchObject({ id: 6, name: "Frank Fisher" });
    expect(await getOfficerDataByEmail("carol@purdue.edu")).toBeNull();
  });

  it("getGearHours returns the `gearhours` key the gear closet page reads", async () => {
    expect(await getGearHours()).toEqual([
      { name: "Erin Evans", gearhours: [{ day: "Monday", time: "5-7pm" }] },
    ]);
  });

  it("getLeaderDataByPosition returns the officer shape the pages render", async () => {
    expect(await getLeaderDataByPosition("President")).toEqual({
      position: "President",
      officerData: { ImagePath: "placeholder.png" },
      name: "Dave Davis",
      email: "dave@purdue.edu",
      pronouns: "he/him",
      phone: "765-555-0004",
    });
    expect(await getLeaderDataByPosition("Nobody")).toBeUndefined();
  });

  it("getLeaderData groups officers by branch", async () => {
    const branches = Object.fromEntries(
      (await getLeaderData()).map((b) => [
        b.label,
        b.content.map((o) => o.name),
      ]),
    );

    expect(branches.Executive).toEqual(["Dave Davis"]);
    expect(branches.Operations).toEqual(["Alice Anderson"]);
    expect(branches.Gear).toEqual(["Erin Evans"]);
    expect(branches.Outreach).toEqual([
      "Frank Fisher",
      "Frank Fisher",
      "Bob Brown",
    ]);
  });

  it.each([
    [1, true],
    [3, false],
  ])("verifyMemberIsOfficer(%i) is %s", async (memberId, expected) => {
    expect(await verifyMemberIsOfficer(memberId)).toBe(expected);
  });
});
