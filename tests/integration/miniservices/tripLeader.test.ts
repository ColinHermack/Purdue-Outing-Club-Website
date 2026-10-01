import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetDb } from "../db";

import {
  createTripLeader,
  getAllTripLeaders,
  getTripLeader,
  updateTripLeader,
} from "@/miniservices/tripLeaderMiniService";

describe("tripLeaderMiniService against the test DB", () => {
  beforeEach(async () => {
    await resetDb();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("getAllTripLeaders joins member data, sorted by name", async () => {
    const leaders = await getAllTripLeaders();

    expect(leaders.map((l) => l.member?.name)).toEqual([
      "Alice Anderson",
      "Carol Clark",
    ]);
    expect(leaders[0]).toMatchObject({
      sport: ["Backpacking", "Caving"],
      process: { shadow: true, approved: true, certified: true },
      leadCount: 2,
      member: { firstAidData: { type: "WFA", verified: true } },
    });
  });

  it("createTripLeader round-trips sport and process", async () => {
    const created = await createTripLeader({
      memberId: 2,
      sport: ["Whitewater", "Canoeing"],
      process: { shadow: true, approved: false, certified: true },
      gmail: "bob@gmail.com",
    });

    expect(created).toBe(true);
    expect(await getTripLeader(2)).toMatchObject({
      sport: ["Whitewater", "Canoeing"],
      process: { shadow: true, approved: false, certified: true },
      leadCount: 0,
      gmail: "bob@gmail.com",
      member: { id: 2, name: "Bob Brown" },
    });
  });

  it("createTripLeader returns false for a member that does not exist", async () => {
    expect(
      await createTripLeader({ memberId: 999, sport: ["Hiking"], process: {} }),
    ).toBe(false);
  });

  it("createTripLeader returns false for an existing trip leader", async () => {
    expect(
      await createTripLeader({ memberId: 1, sport: ["Hiking"], process: {} }),
    ).toBe(false);
  });

  it("updateTripLeader changes sport, process and gmail", async () => {
    const updated = await updateTripLeader({
      memberId: 3,
      sport: ["Climbing", "Caving"],
      process: { shadow: true, approved: true, certified: true },
      gmail: "carol.new@gmail.com",
    });

    expect(updated).toBe(true);
    expect(await getTripLeader(3)).toMatchObject({
      sport: ["Climbing", "Caving"],
      process: { shadow: true, approved: true, certified: true },
      gmail: "carol.new@gmail.com",
      leadCount: 1,
    });
  });
});
