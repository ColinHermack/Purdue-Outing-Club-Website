/**
 * This page contains information on how to join the Purdue Outing Club.
 *
 * @author Colin Hermack
 */

import React from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";

export const metadata = {
  title: "Join",
  description: "Information on how to join the Purdue Outing Club.",
};

export default function JoinPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        How to Join
      </h1>

      <p className="flex-left w-3/4 mt-5">
        Once you&#39;ve paid dues, you will receive an email with further
        instructions. Either follow the instructions in the email or continue
        with the remaining steps on this page.
      </p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-4 text-xl">Step 1: Pay Dues</h2>
      <p className="flex-left w-3/4 text-center">
        If you receive need-based financial aid, your dues are eligible to be
        waived. Fill out the dues waiver, and mark out all sensitive information
        other than your name and proof of financial aid receipt. Only the POC
        treasurer and secretary of the treasury will have access to this
        information.
      </p>
      <p className='flex-left w-3/4 text-center mt-4'>
        If you fill out the dues waiver, DO NOT pay dues in TooCool. If the waiver is accepted,
        you will not have to pay dues. If the waiver is rejected, only then must you pay dues.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-10 mb-4"
        href="https://www.toocoolpurdue.com/TooCOOLPurdueWL/vECItemCatalogOrganizationItems/OrganizationItemsGallery.aspx?Organization=1231"
        rel="noopener noreferrer"
        target="_blank"
      >
        Pay Dues
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-4"
        href="https://forms.office.com/r/SHebtBNcke"
        rel="noopener noreferrer"
        target="_blank"
      >
        Dues Waiver
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">
        Step 2: Policy Agreement
      </h2>
      <p className="w-3/4 text-center">
        Once you&#39;ve payed dues, you must complete the club policy agreement
        before signing up for trips.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="https://forms.office.com/Pages/ResponsePage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUMktTMk9HWTBNVEcyQVZEUFJZNzE2SUU1MC4u"
        rel="noopener noreferrer"
        target="_blank"
      >
        Policy Agreement
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">Step 3: RecWell Waiver</h2>
      <p className="w-3/4 text-center">
        Per university policy, you must complete a waiver for RecWell before
        joining the club.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=6d628f57-6989-4bf9-8bd6-511f6a0d0250&env=na2&acct=9ad6adfd-6804-409b-91bc-173cbee909f9&v=2"
        rel="noopener noreferrer"
        target="_blank"
      >
        RecWell Waiver
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">
        Step 4: Join the Mailing List
      </h2>
      <p className="w-3/4 text-center">
        Click the button below to join the mailing list. Once your email client
        opens, just click send to sign up.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="mailto:listserv@lists.purdue.edu?body=SUBSCRIBE%20poc"
        target="_blank"
      >
        Join Mailing List
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">Step 5: Stay Connected</h2>
      <p className="w-3/4 text-center">
        Keep up with the latest Outing Club happenings by joining the Slack and
        following the club Instagram.
      </p>

      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="https://purdueouting.slack.com/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Slack
      </Button>

      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="https://www.instagram.com/purdue.outing.club/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Instagram
      </Button>

      <Divider className="my-10" />
      <h2 className="font-bold text-center text-xl">
        First Aid Certifications
      </h2>
      <p className="w-3/4 text-center">
        Do you have a CPR, first aid, lifeguarding, or other safety
        certification? Upload it below.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold mt-8"
        href="https://forms.office.com/pages/responsepage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUMjM1RFc1RlBBNUNFMkZKTUdBWlVYTjFQVS4u&route=shorturl"
        rel="noopener noreferrer"
        target="_blank"
      >
        Submit Here
      </Button>
    </div>
  );
}
