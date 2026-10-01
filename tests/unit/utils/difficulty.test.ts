import { describe, expect, it } from "vitest";

import { TRIP_DIFFICULTY_DESCRIPTIONS } from "@/config/constants";
import { getTripDifficultyDescription } from "@/utils/difficulty";

const backpacking = TRIP_DIFFICULTY_DESCRIPTIONS.Backpacking;

describe("getTripDifficultyDescription", () => {
  it.each([
    ["level 1", 1, "Backpacking", backpacking[0]],
    ["a middle level", 3, "Backpacking", backpacking[2]],
    ["the highest level", 4, "Backpacking", backpacking[3]],
    [
      "a level above the max clamps to the highest",
      9,
      "Backpacking",
      backpacking[3],
    ],
    [
      "a sport with a single level",
      3,
      "Climbing",
      TRIP_DIFFICULTY_DESCRIPTIONS.Climbing[0],
    ],
    ["an unknown sport", 1, "Underwater Basket Weaving", ""],
  ])("returns the description for %s", (_, difficulty, sport, expected) => {
    expect(getTripDifficultyDescription(difficulty, sport)).toBe(expected);
  });
});
