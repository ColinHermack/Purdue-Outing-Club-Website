"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("/api/trips/open")
      .then((response) => response.json())
      .then((data) => {
        for (let i = 0; i < data.length; i++) {
          data[i].startdate = new Date(data[i].startdate);
        }
        setTrips(data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">Trips</h1>
      <p className='my-4'>
        A note on signing up for trips: sometimes the form may ask you whether you want to create a new draft or 
        use a previous draft. ALWAYS CLICK NEW DRAFT. Otherwise you will not be signed up for the trip properly.
      </p>
      <h2 className="mt-10 mb-4 text-center font-bold text-2xl">
        Accepting Signups
      </h2>
      <div>
        {trips.length > 0 ? (
          trips.map((trip: any) => (
            <Link
                  className="text-amber-400"
                  href={`/trips/${trip.trip_id}`}
            >
              <Card className="w-[400px] my-2">
                <CardHeader className="flex gap-3">
                  <div className="flex flex-col items-left">
                    <p className="text-md font-bold text-amber-400">{trip.name}</p>
                    <p className="text-small text-default-500 text-left">{trip.startdate.toLocaleDateString().replace(/\//g, "-")}</p>
                    <p className="text-small text-default-500 text-left">{trip.startdate.toLocaleTimeString()}</p>
                    <p></p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-row justify-left items-center">
                    <FaMapMarkerAlt />
                    <p className="ml-4">{trip.location}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        ) : (
          <p>No trips currently open.</p>
        )}
      </div>
    </div>
  );
}
