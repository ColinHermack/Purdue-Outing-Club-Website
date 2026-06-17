/**
 * This page contains information for prospective corporate sponsors of the club.
 *
 * @author Colin Hermack
 */

import React from "react";
import { Separator, Link, buttonVariants, Card } from "@heroui/react";

import { getLeaderDataByPosition } from "@/miniservices/officerMiniService";

export const metadata = {
  title: "Sponsorship",
  description: "Sponsorship information for the Purdue Outing Club.",
};

const sponsors = [
  {
    name: "Celsius",
    image: "/sponsors/celsius_logo.webp",
    website: "https://www.celsius.com",
  },
  {
    name: "Subaru",
    image: "/sponsors/subaru_logo.png",
    website: "https://www.subaru.com",
  },
];

export default async function SponsorshipPage() {
  const officerData = await getLeaderDataByPosition(
    "Fundraising & Sponsorship",
  );

  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Sponsorship
      </h1>
      <h2 className="font-bold text-center my-10 text-xl">
        Welcome to all new and returning sponsors!
      </h2>

      <p className="text-center w-3/4">
        The Purdue Outing Club holds events like POCAR every year that connect
        us to other colleges and outdoor enthusiasts. We lead trips across the
        nation, and currently have over 700 active members.
      </p>

      <Separator className="my-5" />

      <h2 className="font-bold text-center mb-5 text-xl">Our Past Partners</h2>
      <div className="w-full flex flex-col justify-top items-center">
        {sponsors.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt={`${item.name} logo`}
                className="my-12"
                src={item.image}
                width={200}
              />
            </Link>
          );
        })}
      </div>

      <Separator className="my-5" />
      <h2 className="font-bold text-center mb-5 text-xl">
        Our Goals in Partnership
      </h2>

      <p className="text-center w-3/4 my-2">
        Financial support for club gear and trip opportunities
      </p>
      <p className="text-center w-3/4 my-2">Brand exposure</p>
      <p className="text-center w-3/4 my-2">Community connections</p>
      <p className="text-center w-3/4 my-2">Mutual benefits</p>

      <img
        className="mt-5 max-w-full"
        src="/pocar_celsius_group.jpg"
        width={400}
      />

      <h2 className="font-bold text-center mt-10 mb-5 text-xl">
        Types of Sponsorship
      </h2>

      <Link
        className={buttonVariants({ className: "m-5" })}
        href="https://www.rei.com/lists/418038518"
        rel="noopener noreferrer"
        target="_blank"
      >
        Purchase Items from the Wishlist
      </Link>
      <Link
        className={buttonVariants({ className: "m-5" })}
        href="https://connect.purdue.edu/s/givenow?_ga=2.241255040.340950724.1694472480-995752346.1694186482&appealcode=10091&dids=004657&sort=1"
        rel="noopener noreferrer"
        target="_blank"
      >
        Donate to the Club
      </Link>
      {officerData !== undefined ? (
        <Link
          className={buttonVariants({ className: "m-5" })}
          href={`mailto:${officerData.email}`}
        >
          Partner with us for an event
        </Link>
      ) : (
        <></>
      )}

      <Separator className="my-5" />

      <h2 className="font-bold text-center text-xl">Want to Learn More?</h2>
      <p className="text-center w-3/4 my-2">
        Contact our fundraising, sponsorship, & alumni officer with questions.
      </p>

      {officerData !== undefined ? (
        <Card className="m-4 py-2">
          <Card.Header className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">{officerData.name}</p>
            <small className="text-default-500">{officerData.pronouns}</small>
            <Link
              className="text-amber-400 text-small"
              href={`mailto:${officerData.email}`}
            >
              {officerData.email}
            </Link>
            <h4 className="font-bold text-large mt-2">
              {officerData.position}
            </h4>
          </Card.Header>
          <Card.Content className="overflow-visible py-2 justify-center items-center mb-4">
            <div className="size-52 overflow-hidden rounded-xl shrink-0">
              <img
                alt="Card background"
                className="object-cover w-full h-full"
                src={`/leadership/${officerData.officerData.ImagePath}`}
              />
            </div>
          </Card.Content>
        </Card>
      ) : (
        <></>
      )}
    </div>
  );
}
