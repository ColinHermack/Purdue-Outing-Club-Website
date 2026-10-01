import { beforeEach, describe, expect, it, vi } from "vitest";

import { pgClient, queryReturns } from "../helpers";

import {
  getOpenTrips,
  getTripData,
  getTripsByMemberId,
} from "@/miniservices/tripMiniService";

vi.mock("pg", async () => (await import("../helpers")).pgModule);

const start = new Date("2026-10-10T12:00:00Z");

describe("tripMiniService", () => {
  beforeEach(() => {
    pgClient.query.mockResolvedValue({ rows: [] });
  });

  it("maps trip rows to TripDTOs", async () => {
    queryReturns([
      {
        trip_id: 1,
        name: "Red River",
        startDate: start,
        sport: "Climbing",
        location: "KY",
      },
    ]);

    expect(await getOpenTrips()).toEqual([
      expect.objectContaining({
        tripId: 1,
        name: "Red River",
        startDate: start,
        sport: "Climbing",
        location: "KY",
      }),
    ]);
  });

  it("getTripData returns undefined for an unknown trip", async () => {
    expect(await getTripData("404")).toBeUndefined();
    expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), ["404"]);
  });

  it("getTripsByMemberId passes the member id as a parameter", async () => {
    queryReturns([{ trip_id: 2, name: "Smokies" }]);

    expect(await getTripsByMemberId(5)).toEqual([
      expect.objectContaining({ tripId: 2 }),
    ]);
    expect(pgClient.query).toHaveBeenCalledWith(expect.any(String), [5]);
  });

  it.each([
    ["getOpenTrips", () => getOpenTrips(), []],
    ["getTripData", () => getTripData("1"), undefined],
    ["getTripsByMemberId", () => getTripsByMemberId(1), []],
  ])(
    "%s swallows query errors and releases the client",
    async (_, read, fallback) => {
      pgClient.query.mockRejectedValueOnce(new Error("boom"));

      expect(await read()).toEqual(fallback);
      expect(pgClient.release).toHaveBeenCalledTimes(1);
    },
  );
});
