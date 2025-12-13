'use client';

import { Divider } from "@heroui/divider";
import { Image, Button, Link } from "@heroui/react";
import { FaInstagram } from "react-icons/fa";

export default function ClimbingTeamPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Purdue Climbing Team
      </h1>

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_group.png"
        width={500}
      />

      <p className="my-4 text-center max-w-[800px]">
        The Purdue Climbing Team is a group of climbers of any skill level who
        train together and compete in both bouldering and ropes climbing
        competitions in the US collegiate circuit.
      </p>
      <p className="my-4 text-center max-w-[800px]">
        We have won a divisional championship, received many individual podium
        placements and wins, and have even sent many climbers to the national
        championships.
      </p>
      <p className="my-4 text-center max-w-[800px]">
        If you like climbing, want to be part of a team that is dedicated to
        improving, and want to attend fun competitions around the US, you should
        consider joining!
      </p>
      <p className="my-4 text-center max-w-[800px]">
        To join the team you need to join the Outing Club and get a USA Climbing
        membership (either recreational or competitive), and attend team
        workouts.
      </p>

      <Divider className="my-5 w-[800px]" />

      <h2 className="font-bold text-center text-xl">
        Want to become a part of the team and learn more?
      </h2>

      <p className="my-4 text-center max-w-[800px]">
        Fill out the interest form below to let us know! No prior experience is
        required.
      </p>

      <Button
        isExternal
        as={Link}
        className="bg-amber-400 text-black w-44 h-20 text-lg m-4 rounded-3xl font-bold"
        href="https://docs.google.com/forms/d/e/1FAIpQLSdhVfrDE-FQNU2DG-xJnPN1quN7yGC0uFejq2ImBOUO9AqNKQ/viewform"
        variant="flat"
      >
        Interest Form
      </Button>

      <Divider className="my-5 w-[800px]" />

      <h2 className="font-bold text-center text-xl">
        Check out the team on Instagram
      </h2>

      <Button
        isExternal
        as={Link}
        className="bg-amber-400 text-black h-20 h-20 text-4xl m-4 rounded-3xl font-bold"
        href="https://www.instagram.com/purdueclimbingteam/"
        variant="flat"
      >
        <FaInstagram />
      </Button>

      <Divider className="my-5 w-[800px]" />

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_1.jpg"
        width={500}
      />

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_2.jpg"
        width={500}
      />

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_3.jpg"
        width={500}
      />

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_4.jpg"
        width={500}
      />

      <Image
        alt="The Purdue Climbing Team"
        className="my-8"
        src="/climbingteam/climbing_team_5.jpg"
        width={500}
      />
    </div>
  );
}
