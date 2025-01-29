"use client";

import React from "react";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";

export default function TripLeaderPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 md:py-10">
      <title>Trip Leaders - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Trip Leaders
      </h1>
      <Image
        alt="POC Trip Leaders"
        className="mt-5 max-w-full"
        src="/trip_leaders.JPG"
        width={400}
      />
      <p className="text-center max-w-full mt-5">
        Trip leaders are members of the club who are permitted to plan and
        leader their own trips, and help officers run trips that they did not
        plan themselves. This role does not require committment or trip quotas,
        and does not have mandatory attendance.
      </p>
      <p className="text-center max-w-full mt-5">
        For a more detailed explanation, read the{" "}
        <Link
          className="text-amber-400"
          href="/docs/trip_leader_overview.pdf"
          target="_blank"
        >
          trip leader overview
        </Link>
        .
      </p>

      <Divider className="my-5" />
      <h2 className="font-bold text-center text-xl">
        Benefits of becoming a trip leader
      </h2>
      <p className="text-center max-w-full">
        Access to heavily discounted first aid classes.
      </p>
      <p className="text-center max-w-full">
        Authorization to plan and lead your own trips.
      </p>
      <p className="text-center max-w-full">
        Ability to check out gear reserved for leadership on trips you lead.
      </p>
      <p className="text-center max-w-full">
        Ability to apply for sports officer and head sports officer positions.
      </p>
      <p className="text-center max-w-full">
        Invitations to leadership meetings to help plan and run events and
        trips.
      </p>

      <Divider className="my-5" />
      <h2 className="font-bold text-center text-xl">
        Apply to become a trip leader
      </h2>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold"
        href="https://docs.google.com/forms/d/e/1FAIpQLSfrpYoz1rnsuiER9PazbMtaIZJkOdKr0gOGpXBE6KPAmUKbXg/viewform?usp=sf_link"
        rel="noopener noreferrer"
        target="_blank"
      >
        Apply
      </Button>

      <p className="text-center max-w-full mt-5">
        Before you can lead trips, you will need to obtain a CPR certification.
        Please submit proof of your certification here for approval by our
        health and safety officer.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold"
        href="https://forms.office.com/pages/responsepage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUMjM1RFc1RlBBNUNFMkZKTUdBWlVYTjFQVS4u&route=shorturl"
        rel="noopener noreferrer"
        target="_blank"
      >
        Submit Here
      </Button>

      <Divider className="my-5" />
      <h2 className="font-bold text-center text-xl">FAQ</h2>
      <Accordion>
        <AccordionItem
          key="1"
          aria-label="why-become-trip-leader"
          title="Why become a trip leader?"
        >
          Trip leaders are able to get more involved in the club by leading
          their own trips. It is also necessary to become a trip leader before
          becoming a sports officer. Members who are interested in becoming a
          trip leader should apply as soon as they are ready.
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="what-responsibilities"
          title={'What are a trip leader"s responsibilities?'}
        >
          Trip leaders are not part of club leadership, but they are
          occasionally invited to attend leadership meetings. Trip leaders are
          responsible for positively representing the club, welcoming new
          members, and helping members learn. Trip leaders are also responsible
          for following all club guidelines and maintaining safety on trips that
          they lead. Additionally, trip leaders are responsible for completing
          some paperwork on trips that they lead.
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="what-is-difference"
          title="What is the difference between a trip leader, sports officer, and head sports officer?"
        >
          Unlike officers, trip leaders are not part of club leadership, and do
          not have the roles or as many responsibilities as a sports officer. It
          is a more flexible role which trip leaders can adjust to firt their
          schedule. Officers have more responsibility and ability to shape the
          club. Head sports officers have final say on all decisions made by
          their officers and trip leaders. Becoming a trip leader is a great way
          to get involved in the club before moving on to higher positions.
        </AccordionItem>
        <AccordionItem
          key="4"
          aria-label="steps-to-become"
          title="What are the steps to becoming a trip leader?"
        >
          The first step to becoming a trip leader is to express interest in a
          sport by going on a trip with a sports officer. After that, you can
          apply to become a trip leader. If approved, you will need to complete
          first aid training and trip leader training. More detailed steps can
          be found in the trip leader overview.
        </AccordionItem>
        <AccordionItem
          key="5"
          aria-label="not-selected"
          title="I was not selected as a trip leader after applying. What should I do?"
        >
          If you are not selected after applying to become a trip leader, you
          can apply again next semester. It is recommended that you talk to your
          head sports officer to find out how to increase your experience and
          demonstrate that you are ready to lead trips. If you are not selected,
          it is probably because you need to build more experience to show that
          you are able to lead trips smoothly and safely.
        </AccordionItem>
        <AccordionItem
          key="6"
          aria-label="need-to-reapply"
          title="Do I have to reapply to be a trip leader?"
        >
          No. Unlike club leadership positions, a trip leader&#39;s tenure only
          ends if they quit, graduate, move on to a higher positions, or are
          removed by the admin board.
        </AccordionItem>
      </Accordion>
    </div>
  );
}
