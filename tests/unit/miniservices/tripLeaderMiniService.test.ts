import { beforeEach, describe, expect, it, vi } from "vitest";

import { memberRow, pgClient, queryReturns } from "../helpers";

import {
  createTripLeader,
  getAllTripLeaders,
  getTripLeader,
  updateTripLeader,
} from "@/miniservices/tripLeaderMiniService";

vi.mock("pg", async () => (await import("../helpers")).pgModule);

const tripLeaderRow = (overrides: object = {}) => ({
  ...memberRow(),
  sport: "Backpacking, Caving",
  process: { shadow: true, approved: true, certified: false },
  lead_count: 2,
  gmail: "alice@gmail.com",
  ...overrides,
});

const newLeader = {
  memberId: 3,
  sport: ["Climbing", "Caving"],
  process: { shadow: true, approved: false, certified: true },
  gmail: "carol@gmail.com",
};

describe("tripLeaderMiniService", () => {
  beforeEach(() => {
    pgClient.query.mockResolvedValue({ rows: [] });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("maps a joined row, normalizing capitalized json keys", async () => {
    queryReturns([tripLeaderRow()]);

    const [leader] = await getAllTripLeaders();

    expect(leader).toMatchObject({
      sport: ["Backpacking", "Caving"],
      process: { shadow: true, approved: true, certified: false },
      leadCount: 2,
      gmail: "alice@gmail.com",
      member: {
        id: 1,
        firstAidData: { type: "WFA", expires: "2099-01-01", verified: true },
        emergencyData: {
          name: "Pat",
          email: "pat@example.com",
          phone: "765-555-1001",
          relation: "Parent",
        },
        medicalData: {
          allergies: "None",
          conditions: "None",
          medications: "None",
        },
      },
    });
  });

  it("maps null json columns to undefined", async () => {
    queryReturns([
      tripLeaderRow({
        first_aid_data: null,
        emergency_data: null,
        medical_data: null,
      }),
    ]);

    const leader = await getTripLeader(1);

    expect(leader?.member?.firstAidData).toBeUndefined();
    expect(leader?.member?.emergencyData).toBeUndefined();
    expect(leader?.member?.medicalData).toBeUndefined();
  });

  it("getTripLeader returns null when the member is not a trip leader", async () => {
    expect(await getTripLeader(99)).toBeNull();
    expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), [99]);
  });

  it("createTripLeader joins sports and passes process flags as parameters", async () => {
    expect(await createTripLeader(newLeader)).toBe(true);
    expect(pgClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO trip_leader"),
      [3, "Climbing, Caving", true, false, true, "carol@gmail.com"],
    );
  });

  it("updateTripLeader puts memberId last to match the WHERE clause", async () => {
    expect(await updateTripLeader(newLeader)).toBe(true);
    expect(pgClient.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE trip_leader"),
      ["Climbing, Caving", true, false, true, "carol@gmail.com", 3],
    );
  });

  it.each([
    ["createTripLeader", () => createTripLeader(newLeader)],
    ["updateTripLeader", () => updateTripLeader(newLeader)],
  ])(
    "%s returns false and releases the client when the query fails",
    async (_, write) => {
      pgClient.query.mockRejectedValueOnce(new Error("fk violation"));

      expect(await write()).toBe(false);
      expect(pgClient.release).toHaveBeenCalledTimes(1);
    },
  );
});
