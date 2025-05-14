/**
 * Includes utilities related to displaying trip difficulty levels.
 *
 * @author Colin Hermack
 */

import { tripDifficultyDescriptions } from "@/config/constants";

/**
 * Given a difficulty number and sport, returns the description of the difficulty level.
 *
 * If the sport is not found in the list of supported sports, returns an empty string.
 *
 * If the difficulty number is higher than the highest listed difficulty for the sport,
 * returns the highest listed difficulty for the sport.
 *
 * Otherwise, returns the description of the difficulty for the given sport at the given
 * difficulty level.
 *
 * @param difficulty - The difficulty number to get the description of.
 * @param sport - The sport to which the difficulty number corresponds.
 * @returns The description of the difficulty level.
 */
export function getTripDifficultyDescription(
  difficulty: number,
  sport: string,
): string {
  if (!Object.keys(tripDifficultyDescriptions).includes(sport)) {
    return "";
  }

  if (tripDifficultyDescriptions[sport].length < difficulty) {
    return tripDifficultyDescriptions[sport][
      tripDifficultyDescriptions[sport].length - 1
    ];
  }

  return tripDifficultyDescriptions[sport][difficulty - 1];
}
