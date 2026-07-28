/**
 * Checklist of steps a trip leader needs to take in order to lead a trip.
 *
 * Access is restricted to signed-in trip leaders (and officers). The role check runs here via
 * the /api/protected/stats endpoint. Anyone who isn't a trip leader is shown a message
 * directing them to become one first.
 *
 */

"use client";

import { useState, useEffect } from "react";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

import { MemberStatsT } from "@/config/types";

const TOC_SECTIONS = [
  { label: "Action Items Deadlines", id: "action-items" },
  { label: "APF", id: "apf" },
  { label: "Website Calendar, Announcement, and Sign Ups", id: "calendar" },
  { label: "Making the Roster", id: "roster" },
  {
    label: "Participant Management & Travel Roster",
    id: "participant-management",
  },
  { label: "Paperwork", id: "paperwork" },
  { label: "Misc.", id: "misc" },
];

export default function LeadATripPage() {
  const [user, setUser] = useState<MemberStatsT | null>(null);

  useEffect(() => {
    fetch("/api/protected/stats")
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      });
  }, []);

  const isTripLeader =
    user !== null &&
    (user.position === "Trip Leader" || user.position === "Officer");

  if (user !== null && !isTripLeader) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 md:py-10">
        <title>How to Lead a Trip - Purdue Outing Club</title>
        <h1 className="text-5xl text-amber-400 font-bold text-center">
          How to Lead a Trip
        </h1>
        <Divider className="my-5" />
        <p className="text-center max-w-full">
          To lead a trip, you must first become a trip leader. You can learn how
          to become one on the{" "}
          <Link className="text-amber-400" href="/tripleaders">
            trip leaders page
          </Link>
          .
        </p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 md:py-10">
        <title>How to Lead a Trip - Purdue Outing Club</title>
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:py-10">
      <title>How to Lead a Trip - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        How to Lead a Trip
      </h1>

      <Divider className="my-5 w-3/4" />

      {/* Table of Contents */}
      <div className="w-3/4 flex flex-col gap-2">
        <span className="font-bold">Jump to</span>
        {TOC_SECTIONS.map((section) => (
          <button
            key={section.id}
            className="flex items-center gap-2 ml-4 text-left hover:text-amber-400 w-fit"
            onClick={() =>
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>›</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="action-items"
      >
        Action Items Deadlines
      </h2>

      <h3 className="font-bold w-3/4 mt-4 mb-2">
        APF — Minimum Two Weeks in Advance
      </h3>
      <p className="w-3/4">
        If something needs to be submitted last minute, that is okay, but not
        recommended for anything that requires travel or money. An on campus
        movie night is something simple that could be submitted to BoilerLink
        with 1.5 weeks notice.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">
        Travel Roster — Minimum 48 Hours Before Event
      </h3>
      <p className="w-3/4">
        It will make your life easier if you submit this as early as possible.
        If you submit this in the middle of the previous week, it will give
        Purdue a couple business days to review and help you sort out your
        drivers before the Monday morning hard deadline.
      </p>
      <p className="w-3/4 mt-2">
        Even if the roster is not 100% finalized, submit something by Wednesday
        night. The roster can be edited up until Friday afternoon before your
        trip.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">
        Extended Travel Packets — Minimum One Week in Advance
      </h3>
      <p className="w-3/4">
        Form required if trip is 3 nights or more. Contact the Data Analyst (
        <Link className="text-amber-400" href="mailto:yates61@purdue.edu">
          yates61@purdue.edu
        </Link>
        ) to request that a prefilled extended travel packet be generated for
        your trip. Then, send these forms to your GroupMe for participants to
        fill out.
      </p>
      <p className="w-3/4 mt-2">
        To submit extended travel packets, upload the PDFs to a Google Drive
        folder, and use consistent naming conventions to make it easy to follow.
        Make sure to change the sharing settings to ensure that anyone on the
        web can view. Then, share this folder by emailing it to{" "}
        <Link className="text-amber-400" href="mailto:sao@purdue.edu">
          sao@purdue.edu
        </Link>
        .
      </p>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="apf"
      >
        APF
      </h2>
      <p className="w-3/4">
        Create a new APF on{" "}
        <Link
          className="text-amber-400"
          href="http://boilerlink.purdue.edu"
          isExternal
        >
          BoilerLink
        </Link>
        :
      </p>
      <ul className="list-disc w-3/4 pl-6 mt-2 flex flex-col gap-1">
        <li>
          Move cursor over the POC logo in the left navigation until the gear
          pops up
        </li>
        <li>Under Organization Tools &gt; Events &gt; Create a New Event</li>
        <li>
          If you are not able to do this, contact the president to change your
          BoilerLink permissions
        </li>
      </ul>
      <p className="w-3/4 mt-4">
        After submitting the APF, look out for comments made by BOSO, SAO and
        RecWell. They may post questions or ask for additional information. Be
        sure to reply to all of their comments.
      </p>
      <p className="w-3/4 mt-2">
        If applicable, your APF will not be approved until your travel roster is
        also approved. This is usually a couple days before your trip. Do not
        wait on approval to continue planning your trip.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Event Details</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>Basic info, event name, theme, host organization, and description</li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Time and Place</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>Date, time, and location</li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Event Options</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>
          Visibility: campus only, so students logged into BoilerLink looking
          for events can find it
        </li>
        <li>
          Report Self Attendance: no — as trip leaders, you are in charge of
          tracking attendance
        </li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">RSVP Options</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>
          All RSVP options should be turned off since sign ups are run
          independently from BoilerLink
        </li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Post Event Feedback</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>All event feedback options should be turned off</li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">
        Basic Info and Type of Event / Travel
      </h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>
          Club sports home event for an event on campus or within Tippecanoe
          County
        </li>
        <li>
          Club sports travel event for an event leaving campus outside of
          Tippecanoe County
        </li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Club Sports Travel or Home</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>Travel event will require information for mileage, income, and expenses</li>
        <li>
          Home event will require information about room reservations, income,
          and expenses
        </li>
        <li>
          For all expense-related questions, put &quot;0&quot; or &quot;no&quot; unless any
          expenses for the trip are coming from the club account. Longer trips
          with gas reimbursements are a case where you would try to estimate
          club expenses.
        </li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">What Happens Next?</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>Acknowledgement of responsibility for the progress of the APF</li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Protect Purdue</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>Safety Officer: as trip leader, put your name as the safety officer</li>
        <li>
          You may also put the current club Health &amp; Safety officer, but
          only if they are on your roster
        </li>
        <li>Protect Purdue: n/a for all options</li>
        <li>Virtual Option: n/a</li>
      </ul>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Add Reviewers</h3>
      <ul className="list-disc w-3/4 pl-6 flex flex-col gap-1">
        <li>
          Add the current club president, Steven LaCroix (
          <Link className="text-amber-400" href="mailto:slacroi@purdue.edu">
            slacroi@purdue.edu
          </Link>
          ), as a reviewer
        </li>
      </ul>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="calendar"
      >
        Website Calendar, Announcement, and Sign Ups
      </h2>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Website Calendar</h3>
      <p className="w-3/4">
        Follow{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://docs.google.com/document/d/1JqAG2McwT1kPOdLiGLlMFDVONgNhGyvwg0PaYnoFZ_o/edit?usp=sharing"
        >
          these steps
        </Link>{" "}
        to add your trip to the website.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Announcement</h3>
      <p className="w-3/4">
        Once your trip idea is finalized, send an announcement email to both the
        mailing list (
        <Link className="text-amber-400" href="mailto:POC@lists.purdue.edu">
          POC@lists.purdue.edu
        </Link>
        ) and to the #announcements channel in Slack. Some people only check one
        form of communication, so sending it to both is helpful to get as many
        signups as possible. It is helpful to include a link to the website
        signup form in the email. You can also choose to announce the trip at
        the meeting by creating a slide for the presentation.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Sign Ups</h3>
      <p className="w-3/4">
        To view the sign ups for your trip, check the{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://docs.google.com/spreadsheets/u/0/d/105PWIyJgBCmI2Rbl3uPB6v8HcMZPRlycQhVC1nKP4WA/edit"
        >
          master trip signup sheet
        </Link>
        .
      </p>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="roster"
      >
        Making the Roster
      </h2>
      <p className="w-3/4">
        As the trip leader, you decide how you want to select people for your
        trip. The recommended approach is to choose 25% of the roster yourself,
        and 75% of the roster randomly. You can choose to prioritize certified
        drivers, people with cars, and people whose names you don&apos;t
        recognize (meaning they likely do not go on many trips). It is up to
        your discretion.
      </p>
      <p className="w-3/4 mt-4">
        Send out an email to everyone on your trip letting them know they are on
        your roster. Make a GroupMe link for them to join, and give them a
        deadline to join so that you have time to choose someone from the
        waitlist if they drop. Include a comprehensive trip itinerary with
        dates, times, locations, packing list, and expectations.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Waitlist</h3>
      <p className="w-3/4">
        After you have made your trip roster, notify those not on your trip. Be
        sure your sign up on the website is closed, and then BCC everyone in an
        email who is on the waitlist. When people drop your trip, it is your
        obligation to the people on the waitlist to choose people up until the
        minute the last forms are due to Purdue.
      </p>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="participant-management"
      >
        Participant Management &amp; Travel Roster
      </h2>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Driver Board</h3>
      <p className="w-3/4">
        The driver board is important for you as a trip leader to organize
        everyone and ensure all people have transportation for your trip. Each
        car needs 2 certified drivers per vehicle. The full list of certified
        drivers can be found on the{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://docs.google.com/spreadsheets/d/1Q80QiS5nMi4e0RLedgnfmpPVBYgB8KYeDwUGlGLl7vI/edit?usp=sharing"
        >
          master member list
        </Link>
        . Feel free to duplicate the{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://docs.google.com/spreadsheets/d/1Obqgpb5QDxjDV6XJg0Ti6XtI4BEN-UHyUQzgScG9o2I/edit?usp=sharing"
        >
          driver board template
        </Link>
        .
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Tent Board</h3>
      <p className="w-3/4">
        Also included on the driver board template is a tent board. If it is an
        overnight camping trip, ensure that everyone on the trip has a place to
        sleep using this form.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Form Board</h3>
      <p className="w-3/4">
        The form board makes it easy to track the progress of everyone&apos;s
        forms on your trip. Use it to track whether they have joined the
        GroupMe, filled out the driver and tent boards, joined the Splitwise,
        and filled out the Extended Travel Packet (if applicable).
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Travel Roster</h3>
      <p className="w-3/4">
        Submit a screenshot of the &quot;Send to Purdue&quot; sheet on the
        driver board template to the comments of the APF. Ensure that all of
        the cars are highlighted in green, since this means they have a
        sufficient number of certified drivers. Make sure to complete this at
        least 48 hours in advance!
      </p>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="paperwork"
      >
        Paperwork
      </h2>
      <p className="w-3/4">
        All club members are now required to fill out all of the paperwork to be
        able to sign up for trips, so you do not need to worry about tracking
        paperwork.
      </p>

      <Divider className="my-5 w-3/4" />

      <h2
        className="font-bold w-3/4 my-4 text-2xl pl-4 border-l-4 border-amber-400 scroll-mt-8"
        id="misc"
      >
        Misc.
      </h2>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Gas</h3>
      <p className="w-3/4">
        To split gas between participants of the trip, create a Splitwise and
        require everyone to join. This way, everyone will pay the same amount
        for gas.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">
        Google Photos and Recap Slide
      </h3>
      <p className="w-3/4">
        Create a Google Photos album to share photos from the trip with
        participants. Then, use these photos to share a recap slide at the
        meeting following the trip.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Emergency Action Plan</h3>
      <p className="w-3/4">
        An EAP will be needed if your event is particularly long or high risk.
        If Purdue is calling a campus safety meeting for your trip, be prepared
        to make an EAP. Duplicate the{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://docs.google.com/document/d/1pKmdRX6ghayAmE16o9coR7Fi-qHfVZCi9yBGzv-KyoM/edit?usp=sharing"
        >
          EAP Template
        </Link>{" "}
        and update it with the relevant information.
      </p>

      <h3 className="font-bold w-3/4 mt-4 mb-2">Trip Roster and Logs</h3>
      <p className="w-3/4 mb-10">
        After the trip is complete, fill out the{" "}
        <Link
          isExternal
          className="text-amber-400"
          href="https://forms.gle/PQs49AoTFQpe4bgQ8"
        >
          trip roster and logs form
        </Link>
        . This helps greatly by providing important data for the club!
      </p>
    </div>
  );
}
