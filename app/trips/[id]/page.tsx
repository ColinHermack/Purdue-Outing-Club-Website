/*
 * This page displays the details of a specific trip, based on the trip ID which is part of the URL.
 *
 * @Author: Colin Hermack
 */

import { redirect } from "next/navigation";
import { FaMapMarkerAlt, FaCalendar, FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import TripDifficultyCard from "./tripDifficultyIcon";

import { SPORTS } from "@/config/constants";
import { getTripData } from "@/utils/trips";

export default async function TripPage({ params }: any) {
  const paramsLocal = await params;
  const id = paramsLocal.id;
  const tripData = await getTripData(id);

  if (tripData === undefined) {
    redirect("/404");
  }

  return (
    <div className='flex flex-col justify-top items-center w-full'>
      <div className="flex flex-col justify-top items-center max-w-[600px]">
        <h1 className="text-5xl text-amber-400 font-bold text-center max-w-full">
          {tripData.name}
        </h1>
        <div className="flex flex-row justify-left items-center mt-8 w-full text-inherit">
          <FaMapMarkerAlt />
          <p className="text-sm ml-2 font-bold">{tripData.location}</p>
        </div>
        <Link
          className="flex flex-row justify-left items-center mt-2 w-full text-inherit mt-5"
          href="/calendar"
        >
          <FaCalendar className="mr-2" />
          <FaExternalLinkAlt />
        </Link>
        <TripDifficultyCard
          difficulty={tripData.difficulty}
          sport={tripData.sport}
        />
        <p className="mt-10 max-w-[600px]">{tripData.description}</p>
        {tripData.signup ? (
          <Button
            as={Link}
            className="bg-amber-400 text-black font-bold my-10"
            href={
              SPORTS.includes(tripData.sport)
                ? `https://forms.office.com/Pages/ResponsePage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUOVgwNTlJTlJPVEc1T0JETEVUQjJCNzNGTy4u&r603986e16a1343eb98dfe6f6af3bb910=${tripData.trip_id}&r919debb6446f4715b466a83613dde11a=%22${tripData.sport}%22`
                : `https://forms.office.com/Pages/ResponsePage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUOVgwNTlJTlJPVEc1T0JETEVUQjJCNzNGTy4u&r603986e16a1343eb98dfe6f6af3bb910=${tripData.trip_id}&r919debb6446f4715b466a83613dde11a=%22Miscellaneous%22`
            }
            variant="flat"
          >
            Sign Up
          </Button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
