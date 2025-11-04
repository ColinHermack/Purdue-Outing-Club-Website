"use client";

/**
 * This page contains information about the 2025 POCAR race. It will need to be updated soon with information about the
 * 2026 race.
 *
 * @author Colin Hermack
 */

import React, { useRef, useEffect } from "react";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Accordion, AccordionItem } from "@heroui/accordion";

export default function PocarPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <title>POCAR 2026 - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center mb-10">
        POCAR 2026
      </h1>

      <h2 className="font-bold text-center mb-10 text-xl">
        General Race Information
      </h2>
      <p className="text-left w-3/4 my-2">
        <strong>Location:</strong> Yellowwood State Forest
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Date:</strong> January 16-19, 2025
      </p>

      <p className="text-left w-3/4 mt-2">
        <strong>Race Fees</strong>
      </p>
      <p className="text-left w-3/4 my-2"><strong>Purdue Outing Club Members:</strong> $35</p>
      <p className="text-left w-3/4 my-2"><strong>Collegiate:</strong> $70</p>
      <p className="text-left w-3/4 my-2"><strong>Open:</strong> $80</p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">Racer Information</h2>
      
      <p className="text-left w-3/4 my-2"><strong>Check In:</strong> Opens at 8:30 AM, January 17, 2025</p>
      <p className='text-left w-3/4 mt-2'><strong>Race Start (Open):</strong> 10:00 AM, January 17, 2025</p>
      <p className='text-left w-3/4'><strong>Race Start (Collegiate):</strong> 10:30 AM, January 17, 2025</p>

      <p className='text-left w-3/4 mb-2'>Teams who do not check in by the race start time for their division will be disqualified.</p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">
        Volunteer Information
      </h2>
      <p className="text-left w-3/4 my-2">
        Volunteering begins on January 16, 2025 and will last until January 19,
        2025. There will be a mandatory volunteer meeting before the race.
      </p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-4 text-xl">
        Register to Race
      </h2>
      <p className='mb-4'>All registration for racers will be through IMLeagues.</p>
      <Button 
        as={Link}
        isExternal={true}
        className="bg-amber-400 text-black"
        href='http://imleagues.com/Purdue_Outing_POCAR/Orienteering1'
      >
        Racer Registration
      </Button>

      <p className='my-4'>
        If you want to race but do not have a team, or you need additional members for your team, you can find others
        to race with on the team finder.
      </p>
      <Button 
        as={Link}
        isExternal={true}
        className="bg-amber-400 text-black"
        href='https://docs.google.com/spreadsheets/d/1YmNarc1XFBIcolYodnXX9OEf0FW12QcvbZ3mABi1adQ/edit?gid=0#gid=0'
      >
        Team Finder
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">
        Register to Volunteer
      </h2>
      <p className='mb-8'>Volunteers are required to register on both IMLeagues and through the Purdue Outing Club website.</p>
      <Button 
        as={Link}
        isExternal={true}
        className="bg-amber-400 text-black"
        href='http://imleagues.com/Purdue_Outing_POCAR/Orienteering1'
      >
        Volunteer Registration (IMLeagues)
      </Button>

      <Button 
        as={Link}
        className="bg-amber-400 text-black mt-4"
        target='_blank'
        href='/trips/231'
      >
        Volunteer Registration (POC)
      </Button>

      {/*}
      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">More Information</h2>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_emergency_procedures.pdf"
        target="_blank"
        variant="flat"
      >
        Emergency Procedures
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_rules.pdf"
        target="_blank"
        variant="flat"
      >
        Rules
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_instructions.pdf"
        target="_blank"
        variant="flat"
      >
        Instructions
      </Button>
      {*/}

      <Divider className="my-10" />
      <h2 className="font-bold text-center text-xl">FAQ</h2>

      <Accordion defaultExpandedKeys={[1]} selectionMode="multiple">
        <AccordionItem
          key={1}
          aria-label="what-is-pocar"
          title="What is POCAR?"
        >
          The Purdue Outing Club Adventure Race (POCAR) is a 48 hour
          orienteering race held every year over Martin Luther King Jr. Day
          weekend in Southern Indiana. The course can range from 20-40 miles as
          the crow flies, depending on the location and planners. Teams should
          be prepared to cover 50 miles on foot. Teams from all over the world
          come to participate. Alumni often travel many hours to compete. POCAR
          can get cold, rainy, muddy, dirty, exhausting, etc. Now get excited!
        </AccordionItem>
        <AccordionItem
          key={2}
          aria-label="why-in-winter"
          title="Why is POCAR in the middle of the winter?"
        >
          The first POCAR took place in January 2001 during Martin Luther King
          Jr. Day weekend, as have all subsequent POCARs. The strategy behind
          these sets of dates was to allow the racers and volunteers to have a
          day to recover before returning to work and school. A race in the dead
          of winter, when days are short, nights are long, and the weather can
          go from bad to worse quickly, is enough to test anyone&#39;s will and
          endurance.
        </AccordionItem>
        <AccordionItem
          key={3}
          aria-label="how-long-last"
          title="How long does POCAR last?"
        >
          Endurance was the theme of the first race and all others that have
          succeeded it. The race is generally 30+ miles as the crow flies, and
          participants have 48 hours (Saturday morning to Monday morning) to
          cover the distance. This is extremely challenging and sometimes only
          10% of the competitors complete the entire race.
        </AccordionItem>
        <AccordionItem
          key={4}
          aria-label="how-does-it-work"
          title="How does it work?"
        >
          A map is supplied to each team, which they will use to navigate
          point-to-point in a specified order. Once all valid points (there are
          decoys) are visited, a team has completed the course. At each
          checkpoint, the team must sign their name, the time they arrived, and
          any comments, serious or otherwise. This allows the race organizers
          and volunteers to track the progress of the team and provide
          assistance if necessary. A system of punch cards is set up to verify a
          team has indeed found a checkpoint. It is required that at least one
          team member has experience with the UTM coordinate system. There will
          be a beginner orienteering trip in November for those who would like
          to learn.
        </AccordionItem>
        <AccordionItem key={5} aria-label="who-can-race" title="Who can race?">
          Anyone can race. The original POCAR was held exclusively for Purdue
          Outing Club members, but since the event was successful and
          well-received, anyone can now take part.
        </AccordionItem>
        <AccordionItem
          key={6}
          aria-label="will-food-be-provided"
          title="Will food be provided?"
        >
          No. Racers are responsible for their own health and nutrition.
          Nutrition is essential, and significant thought should be put into
          what you will eat.
        </AccordionItem>
        <AccordionItem
          key={7}
          aria-label="what-if-a-team-member-drops-out"
          title="What if a team member drops out?"
        >
          As long as a team still has four members, they can continue the race
          and place. Members from two or more defunct teams may form a hybrid
          team in order to continue the race, but they will not be able to
          place. This is to allow people who may not be able to physically
          complete the race to participate for part of the event. Racing alone
          is strictly prohibited.
        </AccordionItem>
      </Accordion>

      <iframe
        className="w-3/4 md:w-1/3 h-[300px] mt-10 rounded-lg"
        src="https://www.youtube.com/embed/ad_B4YuUdD8"
        title="pocar video"
      >
        Loading...
      </iframe>
    </div>
  );
}
