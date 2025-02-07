import { Tooltip } from "@heroui/tooltip";

import { getTripDifficultyDescription } from "@/utils/difficulty";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface TripDifficultyIconProps {
  difficulty: number;
  sport: string;
}

function getTripDifficultyIcon(difficulty: number) {
  switch (difficulty) {
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

export default function TripDifficultyIcon(props: TripDifficultyIconProps) {
  let difficultyDescription = getTripDifficultyDescription(
    props.difficulty,
    props.sport,
  );

  if (!props.difficulty) {
    return null;
  }

  return (
    <div className="flex flex-col justify-top items-center mt-10">
      <Tooltip content={difficultyDescription}>
        {getTripDifficultyIcon(props.difficulty)}
      </Tooltip>
      <p className="mt-4 font-bold">
        {DIFFICULTIES[props.difficulty - 1]} Difficulty
      </p>
    </div>
  );
}
