"use client";

import React from "react";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

export default function PocarPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        POCAR 2025
      </h1>
      <h2 className="font-bold text-center my-10 text-xl">
        General Race Information
      </h2>
      <p className="text-left w-3/4 my-2">
        <strong>Location:</strong> Morgan Monroe State Forest
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Date:</strong> January 18-20, 2025
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Start Time:</strong> 10:00 AM (Open Division), 10:30 AM
        (Collegiate Division)
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Race Fee:</strong> $400 (Open Division), $250 (Collegiate
        Division)
      </p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">Racer Information</h2>
      <p className="text-left w-3/4 my-2">
        <strong>Check In:</strong> 8:00 AM, January 18, 2025
      </p>
      <p className="text-left w-3/4 my-2">
        <strong>Race Ends:</strong> 10:30 AM, January 20, 2025
      </p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">
        Volunteer Information
      </h2>
      <p className="text-left w-3/4 my-2">
        Volunteering begins on January 17, 2025 and will last until January 20,
        2025. There was a required volunteer meeting on December 2, 2024.
      </p>

      <Divider className="my-10" />

      <h2 className="font-bold text-center mb-10 text-xl">
        Registration Information
      </h2>
      <p className="text-left w-3/4 my-2">
        Registration for both racers and volunteers is now closed. The race fee
        can be paid through TooCool at the link below. Please don&#39;t pay the
        race fee until your team is off the waitlist on IMLeagues.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="https://too-cool.com/registration/POCAR-2025"
        target="_blank"
        variant="flat"
      >
        Pay Race Fee
      </Button>

      <Divider className="my-10" />

      <h2 className="font-bold text-center text-xl">More Information</h2>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_emergency_procedures.pdf"
        target="_blank"
        variant="flat"
      >
        Emergency Procedures
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_rules.pdf"
        target="_blank"
        variant="flat"
      >
        Rules
      </Button>
      <Button
        as={Link}
        className="bg-amber-400 text-black mt-10 font-bold"
        href="/docs/pocar_instructions.pdf"
        target="_blank"
        variant="flat"
      >
        Instructions
      </Button>

      <Divider className="my-10" />
      <h2 className="font-bold text-center text-xl">FAQ</h2>

      <iframe
        className="w-3/4 md:w-1/3 h-[300px] mt-10 rounded-lg"
        src="https://www.youtube.com/embed/ad_B4YuUdD8"
        title="pocar video"
      >
        Loading...
      </iframe>
    </div>
  );
}
