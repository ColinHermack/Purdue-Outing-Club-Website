import React from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export const metadata = {
  title: "Safety Concern Report",
  description: "Report unsafe conditions on Purdue Outing Club trips.",
};

export default function SafetyConcernReportPage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Safety Concern Report
      </h1>
      <p className="my-10 text-center">
        If you felt as though as unsafe situation was created for you or another
        person on a Purdue Outing Club trip, please report it here. You have the
        option of remaining anonymous, but you are encouraged to leave your name
        and contact information so that the safety committee can follow up with
        you. The safety committee includes the president, vice president,
        secretary of sports, health and safety officer, and the diversity and
        community outreach officer. These are the only people who will be able
        to read your response. Thank you for taking the time to complete this
        form.
      </p>
      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold"
        href="https://docs.google.com/forms/d/e/1FAIpQLSfHlU_G1uQAJXvKWEygxDEfJFSKYeRlljdRNLt_Ig48dZUUoQ/viewform?usp=sf_link"
        variant="flat"
      >
        Report
      </Button>
    </div>
  );
}
