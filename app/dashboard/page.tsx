/**
 * A dashboard page which will display various stats to the user like the number of trips they have been on, and their
 * position in the club if they are in leadership. This is going to be the first step of the rollout of user signin
 * which should eventually allow everyone to sign in with their Microsoft Purdue account.
 *
 * @author Colin Hermack
 */

"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import { MemberStatsT } from "@/utils/types";

export default function DashBoardPage() {
  const [user, setUser] = useState<MemberStatsT | null>(null);

  useEffect(() => {
    fetch("/api/protected/stats")
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      });
  }, []);

  return (
    <div className="flex flex-col justify-top items-center">
      <title>My Dashboard - Purdue Outing Club</title>
      <div className="flex flex-col md:flex-row justify-top md:justify-left items-center md:items-start w-screen px-10">
        <div className=" w-[384px] md:w-[300px]">
          <Card className="w-full my-4">
            <CardHeader className="flex flex-col items-left">
              <p className="text-xl font-bold text-amber-400">
                {user !== null ? user.name : "Loading..."}
              </p>
              <p className="text-md">{user !== null ? user.position : ""}</p>
            </CardHeader>
          </Card>
          <Card className="w-full my-4">
            <CardHeader>
              <p className="text-lg font-bold text-amber-400 text-left">
                My Stats
              </p>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-md text-left">
                Total Trips: {user !== null ? user.num_trips_total : ""}
              </p>
              <p className="text-md text-left">
                Trips Led: {user !== null ? user.num_trips_led : ""}
              </p>
            </CardBody>
          </Card>
          <Button
            as={Link}
            className="w-full bg-amber-400 font-bold"
            href="/auth/signout"
            variant="flat"
          >
            Sign Out
          </Button>
        </div>
        <div className="w-[384px] md:w-[500px] mx-4">
          <Card className="w-full my-4 h-[600px]">
            <CardHeader>
              <p className="text-lg font-bold text-amber-400 text-left">
                My Trips
              </p>
            </CardHeader>
            <Divider />
            <CardBody>
              {user !== null && user.trips.length > 0 ? (
                user.trips.map((trip: any) => (
                  <Button
                    key={trip.trip_id}
                    as={Link}
                    className="text-left font-bold"
                    href={`/trips/${trip.trip_id}`}
                    variant="flat"
                  >
                    <p className="text-md text-left">{trip.name}</p>
                  </Button>
                ))
              ) : (
                <p className="text-md text-left">No trips to display.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
