import { tripDifficultyDescriptions } from "@/config/tripDifficultyDescriptions";

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
