"use client";

import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Link } from "@nextui-org/link";

export default function FAQPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <title>FAQ - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Frequently Asked Questions
      </h1>

      <Accordion
        className="mt-10"
        defaultExpandedKeys={[1]}
        selectionMode="multiple"
      >
        <AccordionItem
          key={1}
          aria-label="when-are-gear-hours"
          title="When is the gear closet open?"
        >
          Check the gear closet page{" "}
          <Link className="text-amber-400" href="/gear-closet">
            here
          </Link>{" "}
          to find the current gear hours. Also please check the announcements
          channel of the Slack before going. Gear hours may be cancelled if
          nobody expresses interest in going.
        </AccordionItem>
        <AccordionItem
          key={2}
          aria-label="how-to-unsubscribe"
          title="How do I unsubscribe from the mailing list?"
        >
          Send an email with body &#39;UNSUBSCRIBE poc&#39; to{" "}
          <Link
            className="text-amber-400"
            href="mailto:listserv@lists.purdue.edu"
          >
            listserv@lists.purdue.edu
          </Link>
          .
        </AccordionItem>
        <AccordionItem
          key={3}
          aria-label="assume-not-on-trip"
          title={
            "I signed up for a trip, and haven\'t heard from the trip leader even though it\'s a couple days before the trip. Should I assume I didn\'t get on the trip?"
          }
        >
          Yes. Trip leaders will always reach out to you well in advance of a
          trip to make sure that there is enough time to pick up gear from the
          closet and sort out other logistics before the trip starts.
        </AccordionItem>
        <AccordionItem
          key={4}
          aria-label="who-ask-about-trips"
          title="If I have questions about a trip, who should I ask?"
        >
          If you have questions about a particular trip, you should contact the
          trip leader directly on Slack or whichever communication platform is
          being used for the trip. Your question will get answered more quickly
          this way, since messages in the general channel of the Slack can be
          easily lost.
        </AccordionItem>
        <AccordionItem
          key={5}
          aria-label="chain-of-command"
          title="Who can I talk to about general club concerns?"
        >
          If you have a general concern about the club, you can contact the
          officer responsible for that area of concern by clicking on their
          picture on the{" "}
          <Link className="text-amber-400" href="/pleadership">
            pleadership page
          </Link>
          .
        </AccordionItem>
        <AccordionItem
          key={6}
          aria-label="trip-unsafe"
          title="If I went on a trip and felt unsafe, what should I do?"
        >
          If you went on a club trip and felt as though you or someone else was
          put into an unsafe situation, you can report it{" "}
          <Link className="text-amber-400" href="/safetyconcernreport">
            here
          </Link>
          . This information will only be shared with the club safety committee.
          You have the option of remaining anonymous. If you choose to provide
          your name, it may be used to follow up with you if necessary.
        </AccordionItem>
        <AccordionItem
          key={7}
          aria-label="trip-unable-to-go"
          title={
            "If I was selected for a trip but I\'m unable to go, what should I do?"
          }
        >
          If you were selected for a trip but you are unable to go on that trip,
          you should contact the trip leader as soon as possible so that they
          can select someone else to fill your spot.
        </AccordionItem>
        <AccordionItem
          key={8}
          aria-label="driving-on-trips"
          title={"How does driving work on trips?"}
        >
          If you have a car registered with the club, you will be asked when you sign up for a trip whether you car can
          be used on a trip. Trip leaders will then coordinate transportation to and from the trip location. We almost
          always carpool to and from trips. 
        </AccordionItem>
      </Accordion>
    </div>
  );
}
