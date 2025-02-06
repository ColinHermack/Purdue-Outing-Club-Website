import Image from 'next/image';
import { getTripDifficultyDescription } from '@/utils/difficulty';
import { Tooltip } from "@heroui/tooltip";

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

interface TripDifficultyIconProps {
    difficulty: number
    sport: string
}

function getTripDifficultyIcon(difficulty: number) {
    switch (difficulty) {
        case 1:
            return <Image src='https://upload.wikimedia.org/wikipedia/commons/0/0e/Ski_trail_rating_symbol-green_circle.svg' alt='A green circle' width={64} height={64}></Image>
        case 2:
            return <Image src='https://upload.wikimedia.org/wikipedia/commons/0/0d/Ski_trail_rating_symbol-blue_square.svg' alt='A blue square' width={64} height={64}></Image>
        case 3:
            return <Image src='https://upload.wikimedia.org/wikipedia/commons/0/0c/Ski_trail_rating_symbol-black_diamond.svg' alt='A black diamond' width={64} height={64}></Image>
        case 4:
            return <Image src='https://upload.wikimedia.org/wikipedia/commons/7/78/Ski_trail_rating_symbol-double_black_diamond.svg' alt='Two black diamonds' width={64} height={64}></Image>
    }
}

export default function TripDifficultyIcon(props: TripDifficultyIconProps) {
    let difficultyDescription = getTripDifficultyDescription(props.difficulty, props.sport);

    if (!props.difficulty) {
        return null;
    }

    return (
        <div className='flex flex-col justify-top items-center mt-5'>
            <Tooltip content={difficultyDescription}>
                {getTripDifficultyIcon(props.difficulty)}
            </Tooltip>
            <p className='mt-4 font-bold'>{DIFFICULTIES[props.difficulty - 1]} Difficulty</p>
        </div>
    )
}