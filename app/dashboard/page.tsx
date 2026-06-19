/**
 * A dashboard page which will display various stats to the user like the trips they have been on. This is the first
 * step of the rollout of user signin which should eventually allow everyone to sign in with their Microsoft Purdue
 * account.
 *
 * @author Colin Hermack
 */

"use client";

import { useState, useEffect } from "react";
import { Card, Separator, Link, buttonVariants } from "@heroui/react";

import MemberDTO from "@/dtos/memberDto";
import TripDTO from "@/dtos/tripDto";

export default function DashBoardPage() {
  const [user, setUser] = useState<MemberDTO | null>(null);
  const [trips, setTrips] = useState<TripDTO[]>([]);

  useEffect(() => {
    fetch("/api/protected/user")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: MemberDTO | null) => setUser(data));

    fetch("/api/protected/user/trips")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: TripDTO[]) => setTrips(data));
  }, []);

  return (
    <div className="flex flex-col justify-top items-center">
      <title>My Dashboard - Purdue Outing Club</title>
      <div className="flex flex-col md:flex-row justify-top md:justify-left items-center md:items-start w-screen px-10">
        <div className=" w-[384px] md:w-[300px]">
          <Card className="w-full my-4">
            <Card.Header className="flex flex-col items-left">
              <p className="text-xl font-bold text-amber-400">
                {user !== null ? user.name : "Loading..."}
              </p>
            </Card.Header>
          </Card>
          <Link
            className={buttonVariants({ className: "w-full font-bold" })}
            href="/auth/signout"
          >
            Sign Out
          </Link>
        </div>
        <div className="w-[384px] md:w-[500px] mx-4">
          <Card className="w-full my-4 h-[600px]">
            <Card.Header>
              <p className="text-lg font-bold text-amber-400 text-left">
                My Trips
              </p>
            </Card.Header>
            <Separator />
            <Card.Content>
              {trips.length > 0 ? (
                trips.map((trip: TripDTO) => (
                  <Link
                    key={trip.tripId}
                    className="w-full py-1"
                    href={`/trips/${trip.tripId}`}
                  >
                    <p className="text-md text-left">{trip.name}</p>
                  </Link>
                ))
              ) : (
                <p className="text-md text-left">No trips to display.</p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
