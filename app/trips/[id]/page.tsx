import React from "react";
import { redirect } from "next/navigation";
import { FaMapMarkerAlt, FaCalendar, FaClock } from "react-icons/fa";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { SPORTS } from '@/app/constants';

import { getTripData } from "@/utils/trips";

export default async function TripPage({ params }: any) {
  const id = params.id;
  const tripData = await getTripData(id);

  if (tripData === undefined) {
    redirect("/404");
  }

  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        {tripData.name}
      </h1>
      <div className='flex flex-row justify-left items-center mt-8 w-full text-neutral-500'>
        <FaMapMarkerAlt />
        <p className='text-sm ml-2 font-bold'>{tripData.location}</p>
      </div>
      <div className='flex flex-row justify-left items-center mt-2 w-full text-neutral-500'>
        <FaCalendar />
        <p className='text-sm ml-2 font-bold'>{tripData.startdate.toLocaleDateString().replace(/\//g, "-")}</p>
      </div>
      <div className='flex flex-row justify-left items-center mt-2 w-full text-neutral-500'>
        <FaClock />
        <p className='text-sm ml-2 font-bold'>{tripData.startdate.toLocaleTimeString()}</p>
      </div>
      <p className="mt-10">{tripData.description}</p>
      {tripData.signup ? (
        <Button
        as={Link}
        className="bg-amber-400 text-black font-bold my-10"
        href={SPORTS.includes(tripData.sport) ? `https://forms.office.com/Pages/ResponsePage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUOVgwNTlJTlJPVEc1T0JETEVUQjJCNzNGTy4u&r603986e16a1343eb98dfe6f6af3bb910=${tripData.trip_id}&r919debb6446f4715b466a83613dde11a=%22${tripData.sport}%22` : `https://forms.office.com/Pages/ResponsePage.aspx?id=Ob0wQVN8nEGx5YdY1tY_IYsPEC-CwDJNo7LaWV5ygUJUOVgwNTlJTlJPVEc1T0JETEVUQjJCNzNGTy4u&r603986e16a1343eb98dfe6f6af3bb910=${tripData.trip_id}&r919debb6446f4715b466a83613dde11a=%22Miscellaneous%22`}
        variant="flat"
        >
          Sign Up
        </Button>
      ) : ""}
      
    </div>
  );
}
