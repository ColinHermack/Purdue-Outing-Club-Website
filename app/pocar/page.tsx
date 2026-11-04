"use client";

/**
 * This page contains information about the 2027 POCAR race.
 *
 * @author Colin Hermack
 */

import { Separator, Link, Accordion, buttonVariants } from "@heroui/react";

import { AccordionEntry } from "@/components/accordion-entry";

export default function PocarPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <title>POCAR 2027 - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center mb-10">
        POCAR 2027
      </h1>

      <h2 className="font-bold text-center mb-10 text-xl">
        General Race Information
      </h2>
      <p className="text-left w-3/4 my-2">
        <strong>Location:</strong> Brown County State Park
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Date:</strong> January 15-18, 2027
      </p>

      <p className="text-left w-3/4 mt-2 mb-2">
        <strong>Race Fees</strong>
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Purdue Outing Club Members:</strong> $35
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Collegiate (Non-Members):</strong> $70
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Open:</strong> $85
      </p>

      <Link
        className={buttonVariants({ className: "mb-2" })}
        href="/docs/POCAR%202027%20Race%20Instructions.pdf"
      >
        Race Instructions
      </Link>

      <Link
        className={buttonVariants({ className: "my-4" })}
        href="/docs/POCAR%202027%20Race%20Rules.pdf"
      >
        Race Rules
      </Link>

      <Link
        className={buttonVariants({ className: "mt-2" })}
        href="/docs/EAP%20(Updated%202026-27).pdf"
      >
        Emergency Procedures
      </Link>

      <p className='mt-8 w-3/4 italic'>
        Note that POC semester dues are $30, so Purdue students who are not POC members can save money by paying club dues <a href='/join' className='text-amber-400'>here</a>,
        then paying the member rate for registration.
      </p>

      <Separator className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">Racer Information</h2>

      <p className="text-left w-3/4 my-2">
        <strong>Check In:</strong> Opens at 8:00 AM, January 16, 2027
      </p>
      <p className="text-left w-3/4 mt-2">
        <strong>
          Check In Closes and Pre-Race Meeting:
        </strong>{" "}
        9:30 AM, January 16, 2027
      </p>
      <p className="text-left w-3/4">
        <strong>Race Start (Open):</strong> 10:00 AM, January 16, 2027
      </p>
      <p className="text-left w-3/4">
        <strong>Race Start (Collegiate):</strong> 10:30 AM, January 16, 2027
      </p>

      <br />

      <p className="text-left w-3/4 mb-2">
        Teams who do not check in by the race start time for their division will
        be disqualified.
      </p>

      <Separator className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">
        Volunteer Information
      </h2>
      <p className="text-left w-3/4 my-2">
        Volunteering begins on January 15, 2027 and will last until January 18,
        2027. There will be a mandatory volunteer meeting before the race.
      </p>

      <p className='text-left w-3/4 my-2 mb-4'>
        Volunteering is open to current Purdue Outing Club members.
      </p>

      <Link
        className={buttonVariants({ className: "mt-2" })}
        href="/trips/313"
      >
        Register to Volunteer
      </Link>

      <Separator className="my-10" />

      <h2 className="font-bold text-center mb-4 text-xl">Register to Race</h2>
      <p className="mb-8">
        Racer registration will open on November 10, 2026.
      </p>

      <p className='mb-4'>
        In the meantime, you can connect with other racers and find a team using the team finder.
      </p>

      <Link
        className={buttonVariants({ className: "mt-2" })}
        href="https://docs.google.com/spreadsheets/d/1ezqu6IEfXCB-isGod58h4CeEFiIJBstTMueGqcuxDiQ/edit?usp=sharing"
      >
        Team Finder
      </Link>

      <Separator className="my-10" />

      <iframe
        className="w-3/4 md:w-1/3 h-[300px] mt-10 rounded-lg mb-2"
        src="https://www.youtube.com/embed/ad_B4YuUdD8"
        title="pocar video"
      >
        Loading...
      </iframe>

      <iframe
        className='w-3/4 md:w-1/3 h-[300px] mt-2 rounded-lg mb-10'
        src='https://www.youtube.com/embed/QOmJkC4KiEA'
        title='pocar news report'
      >  
      </iframe>

      <h2 className="font-bold text-center text-xl">FAQ</h2>

      <Accordion defaultExpandedKeys={["1"]} allowsMultipleExpanded>
        <AccordionEntry id="1" title="What is POCAR?">
          The Purdue Outing Club Adventure Race (POCAR) is a 48 hour
          orienteering race held every year over Martin Luther King Jr. Day
          weekend in Southern Indiana. The course can range from 20-40 miles as
          the crow flies, depending on the location and planners. Teams should
          be prepared to cover 50 miles on foot. Teams from all over the world
          come to participate. Alumni often travel many hours to compete. POCAR
          can get cold, rainy, muddy, dirty, exhausting, etc. Now get excited!
        </AccordionEntry>
        <AccordionEntry
          id="2"
          title="Why is POCAR in the middle of the winter?"
        >
          The first POCAR took place in January 2001 during Martin Luther King
          Jr. Day weekend, as have all subsequent POCARs. The strategy behind
          these sets of dates was to allow the racers and volunteers to have a
          day to recover before returning to work and school. A race in the dead
          of winter, when days are short, nights are long, and the weather can
          go from bad to worse quickly, is enough to test anyone&#39;s will and
          endurance.
        </AccordionEntry>
        <AccordionEntry id="3" title="How long does POCAR last?">
          Endurance was the theme of the first race and all others that have
          succeeded it. The race is generally 30+ miles as the crow flies, and
          participants have 48 hours (Saturday morning to Monday morning) to
          cover the distance. This is extremely challenging and sometimes only
          10% of the competitors complete the entire race.
        </AccordionEntry>
        <AccordionEntry id="4" title="How does it work?">
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
        </AccordionEntry>
        <AccordionEntry id="5" title="Who can race?">
          Anyone can race. The original POCAR was held exclusively for Purdue
          Outing Club members, but since the event was successful and
          well-received, anyone can now take part.
        </AccordionEntry>
        <AccordionEntry id="6" title="Will food be provided?">
          No. Racers are responsible for their own health and nutrition.
          Nutrition is essential, and significant thought should be put into
          what you will eat.
        </AccordionEntry>
        <AccordionEntry id="7" title="What if a team member drops out?">
          As long as a team still has four members, they can continue the race
          and place. Members from two or more defunct teams may form a hybrid
          team in order to continue the race, but they will not be able to
          place. This is to allow people who may not be able to physically
          complete the race to participate for part of the event. Racing alone
          is strictly prohibited.
        </AccordionEntry>
      </Accordion>
    </div>
  );
}
