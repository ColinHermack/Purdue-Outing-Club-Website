import { describe, expect, it } from "vitest";

import {
  getOpenTrips,
  getTripData,
  getTripsByMemberId,
} from "@/miniservices/tripMiniService";

describe("tripMiniService against the test DB", () => {
  it("getOpenTrips returns only trips open for signup", async () => {
    const trips = await getOpenTrips();

    expect(trips).toEqual([
      expect.objectContaining({
        tripId: 1,
        name: "Red River Gorge Climbing",
        sport: "Climbing",
      }),
    ]);
    expect(trips[0].startDate).toBeInstanceOf(Date);
  });

  it("getTripData returns the full trip", async () => {
    expect(await getTripData("2")).toMatchObject({
      tripId: 2,
      name: "Smokies Backpacking",
      category: "Break",
      difficulty: 3,
      signup: false,
      location: "Great Smoky Mountains, TN",
    });
  });

  it.each(["999", "not-a-number"])(
    "getTripData(%s) is undefined",
    async (id) => {
      expect(await getTripData(id)).toBeUndefined();
    },
  );

  it("getTripsByMemberId returns the member's trips in id order", async () => {
    expect((await getTripsByMemberId(1)).map((t) => t.tripId)).toEqual([2, 3]);
    expect(await getTripsByMemberId(6)).toEqual([]);
  });
});
