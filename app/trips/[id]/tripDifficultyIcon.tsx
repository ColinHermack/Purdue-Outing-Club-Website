/**
 * Difficulty badge on a trip page: ski-trail style symbol (green circle, blue square, black diamond, double black) plus
 * the label from DIFFICULTIES and the sport-specific description from utils/difficulty.ts.
 *
 * @author Colin Hermack
 */

import { getTripDifficultyDescription } from "@/utils/difficulty";

import { DIFFICULTIES } from "@/config/constants";

interface TripDifficultyIconProps {
  difficulty: number;
  sport: string;
}

function TripDifficultyIcon(props: { difficulty: number }) {
  switch (props.difficulty) {
    case 1:
      return <div className="text-4xl">🟢</div>;
    case 2:
      return <div className="text-4xl">🟦</div>;
    case 3:
      return <div className="text-4xl rotate-45">⬛️</div>;
    case 4:
      return (
        <div className="flex flex-row justify-center items-center gap-5">
          <div className="text-4xl rotate-45">⬛️</div>
          <div className="text-4xl rotate-45">⬛️</div>
        </div>
      );
  }
}

/** Renders nothing when the trip has no difficulty set (0 or null). */
export default function TripDifficultyCard(props: TripDifficultyIconProps) {
  const difficultyDescription = getTripDifficultyDescription(
    props.difficulty,
    props.sport,
  );

  if (!props.difficulty) {
    return null;
  }

  return (
    <div className="flex flex-col justify-top items-center mt-10">
      <TripDifficultyIcon difficulty={props.difficulty} />
      <p className="mt-4 font-bold">
        {DIFFICULTIES[props.difficulty - 1]} Difficulty
      </p>
      <p className="mt-2 text-xs">{difficultyDescription}</p>
    </div>
  );
}
