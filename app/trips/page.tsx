/**
 * This page displays a list of upcoming trips which are available to sign up for.
 *
 * @author Colin Hermack
 */

"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Link,
  Spinner,
  Separator,
} from "@heroui/react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function TripsPage() {
  const [trips, setTrips] = useState(null);

  useEffect(() => {
    fetch("/api/trips/open")
      .then((response) => response.json())
      .then((data) => {
        for (let i = 0; i < data.length; i++) {
          data[i].startDate = new Date(data[i].startDate);
        }
        setTrips(data);
      });
  }, []);

  return (
    <div className="flex flex-col justify-top items-center">
      <title>Trips - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">Trips</h1>
      <p className="mt-10 mb-2 text-center font-bold text-2xl">Signing Up</p>
      <p className="my-4 text-center max-w-3xl">
        To sign up for a trip, select a trip and fill out the form. You should
        get a confirmation email immediately after saying that you’ve
        successfully signed up.
        <br />
        <b>
          Sometimes the form may ask you to create a new draft or use a previous
          draft. ALWAYS CLICK NEW DRAFT. Otherwise you will not be signed up for
          the trip properly.
        </b>
      </p>
      <h2 className="mt-5 mb-8 text-center font-bold text-2xl">
        Accepting Signups
      </h2>
      <div className="flex flex-col mb-8">
        {trips != null ? <TripCards trips={trips} /> : <Spinner />}
      </div>
      <Separator />
      <h2 className="mt-8 mb-2 text-center font-bold text-2xl">
        Getting on Trips
      </h2>
      <ul className="list-disc pl-6 my-4 text-center max-w-3xl min-w-0">
        <li>
          If you talk to the trip leader before signing up for the trip or
          before the roster is selected, you will be more likely to get on the
          trip since you showed interest. You are also substantially more likely
          to get on trips if you are driver certified.
        </li>
        <li>
          Make sure you check your email over the next week, as the trip leader
          will contact you later letting you know if you’ve gotten on the trip
          (or got waitlisted/didn’t get on).
        </li>
        <li>
          If you&apos;re on the trip, this email will contain things you have to
          do before the trip to confirm your spot! (This often involves joining
          a GroupMe and a driver/tent board.)
        </li>

        <b>
          Don&apos;t wait until the last minute to join the GroupMe since there
          might be useful information shared in the days before the trip.
        </b>
      </ul>
      <h2 className="mt-5 mb-2 text-center font-bold text-2xl">Gear</h2>
      <p className="my-4 text-center max-w-3xl min-w-0">
        If you don’t have everything you need, you can borrow from the gear
        closet. If needed, <b>get gear as soon </b> as you can after confirming
        your spot for a trip so that you&apos;re not scrambling at the last
        minute to get gear.
        <br />→ If you can&apos;t make it to any of the gear hours, talk to the
        leader about it.
      </p>
      <h2 className="mt-5 mb-2 text-center font-bold text-2xl max-w-3xl min-w-0">
        Going on the trip
      </h2>
      <p className="my-4 text-center max-w-3xl min-w-0">
        Make sure to communicate with the driver who you signed up for in the
        driver board. They will determine a pickup time and locations based on
        the group.
        <br />
        Have fun!
      </p>
    </div>
  );
}

interface TripCardProps {
  trips: any[];
}

/**
 * Returns a list of TripCards, each representing a trip.
 *
 * Each card contains the trip name, start date, and location.
 *
 * @param props.trips - An array of trips to display. Each trip should
 * have the following properties:
 * - trip_id: The ID of the trip.
 * - name: The name of the trip.
 * - startDate: The date and time the trip starts.
 * - location: The location of the trip.
 *
 * @returns A list of TripCards.
 */
function TripCards(props: TripCardProps) {
  return props.trips.length > 0 ? (
    props.trips
      .sort((a, b) => {
        return a.startDate - b.startDate;
      })
      .map((trip: any) => (
        <Link
          key={trip.trip_id}
          className="text-foreground no-underline hover:no-underline"
          href={`/trips/${trip.trip_id}`}
        >
          <Card className="w-[400px] my-2">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col items-left">
                <p className="text-md font-bold text-amber-400 text-left">
                  {trip.name}
                </p>
                <p className="text-small text-default-500 text-left">
                  {trip.startDate.toLocaleDateString().replace(/\//g, "-")}
                </p>
                <p className="text-small text-default-500 text-left">
                  {trip.startDate.toLocaleTimeString()}
                </p>
                <p />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-left items-center">
                <FaMapMarkerAlt />
                <p className="ml-4">{trip.location}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))
  ) : (
    <p>No trip signups currently open.</p>
  );
}
