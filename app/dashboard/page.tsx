/**
 * A dashboard page which will display various stats to the user like the trips they have been on. This is the first
 * step of the rollout of user signin which should eventually allow everyone to sign in with their Microsoft Purdue
 * account.
 *
 * @author Colin Hermack
 */

"use client";

import { useState, useEffect } from "react";
import { Button, Card, Separator, Link, buttonVariants } from "@heroui/react";

import PageMessage from "@/components/PageMessage";
import MemberDTO from "@/dtos/memberDto";
import TripDTO from "@/dtos/tripDto";
import { protectedFetch } from "@/utils/protectedFetch";

export default function DashBoardPage() {
  const [user, setUser] = useState<MemberDTO | null>(null);
  const [userFailed, setUserFailed] = useState(false);
  const [trips, setTrips] = useState<TripDTO[] | null>(null);
  const [tripsFailed, setTripsFailed] = useState(false);

  useEffect(() => {
    protectedFetch<MemberDTO>("/api/protected/user").then((result) => {
      if (result.status === "ok") setUser(result.data);
      else setUserFailed(true);
    });

    protectedFetch<TripDTO[]>("/api/protected/user/trips").then((result) => {
      if (result.status === "ok") setTrips(result.data);
      else setTripsFailed(true);
    });
  }, []);

  if (userFailed) {
    return (
      <PageMessage
        action={
          <Button onPress={() => window.location.reload()}>Try Again</Button>
        }
        title="Something Went Wrong"
      >
        <title>My Dashboard - Purdue Outing Club</title>
        <p>We couldn&#39;t load your member profile.</p>
      </PageMessage>
    );
  }

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
              {tripsFailed ? (
                <p className="text-md text-left">
                  Couldn&#39;t load your trips.
                </p>
              ) : trips === null ? (
                <p className="text-md text-left">Loading...</p>
              ) : trips.length > 0 ? (
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
