import React from "react";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";

import { getLeaderDataByPosition } from "@/utils/leadership";

export const metadata = {
  title: "Sponsorship",
  description: "Sponsorship information for the Purdue Outing Club.",
};

const sponsors = [
  {
    name: "Celsius",
    image: "/sponsors/celsius_logo.png",
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
    "Fundraising, Sponsorship, & Alumni",
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

      <Divider className="my-5" />

      <h2 className="font-bold text-center mb-5 text-xl">Our Past Partners</h2>
      <div className="w-full flex flex-col justify-top items-center">
        {sponsors.map((item) => {
          return (
            <Link key={item.name} href={item.website} target="_blank">
              <Image
                alt={`${item.name} logo`}
                className="rounded-none my-12"
                rel="noopener noreferrer"
                src={item.image}
                width={200}
              />
            </Link>
          );
        })}
      </div>

      <Divider className="my-5" />
      <h2 className="font-bold text-center mb-5 text-xl">
        Our Goals in Partnership
      </h2>

      <p className="text-center w-3/4 my-2">
        Financial support for club gear and trip opportunities
      </p>
      <p className="text-center w-3/4 my-2">Brand exposure</p>
      <p className="text-center w-3/4 my-2">Community connections</p>
      <p className="text-center w-3/4 my-2">Mutual benefits</p>

      <Image
        className="mt-5 max-w-full"
        src="/pocar_celsius_group.jpg"
        width={400}
      />

      <h2 className="font-bold text-center mt-10 mb-5 text-xl">
        Types of Sponsorship
      </h2>

      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold m-5"
        href="https://www.rei.com/lists/418038518"
        rel="noopener noreferrer"
        target="_blank"
      >
        Purchase Items from the Wishlist
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold m-5"
        href="https://connect.purdue.edu/s/givenow?_ga=2.241255040.340950724.1694472480-995752346.1694186482&appealcode=10091&dids=004657&sort=1"
        rel="noopener noreferrer"
        target="_blank"
      >
        Donate to the Club
      </Button>
      {officerData !== undefined ? (
        <Button
          as={Link}
          className="bg-amber-400 text-black font-bold m-5"
          href={`mailto:${officerData.email}`}
        >
          Partner with us for an event
        </Button>
      ) : (
        <></>
      )}

      <Divider className="my-5" />

      <h2 className="font-bold text-center text-xl">Want to Learn More?</h2>
      <p className="text-center w-3/4 my-2">
        Contact our fundraising, sponsorship, & alumni officer with questions.
      </p>

      {officerData !== undefined ? (
        <Link
          className="text-amber-400 font-bold"
          href={`mailto:${officerData.email}`}
        >
          {officerData.name}
        </Link>
      ) : (
        <></>
      )}
      {officerData !== undefined ? (
        <Image
          alt="POC Fundraising, Sponsorship, & Alumni Officer"
          className="mt-5 max-w-full"
          src={`/leadership/${officerData.officer_data.ImagePath}`}
          width={300}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
