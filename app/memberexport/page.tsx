/**
 * A page that lets the Gear Lord and other authorized officers download every member's name and email as a CSV.
 *
 * @author Colin Hermack
 */

import { buttonVariants } from "@heroui/react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { EXPORT_MEMBERS_AUTHORIZED_POSITIONS } from "@/config/permissions";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";

export default async function MemberExportPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const officerPositions = email ? await getOfficerDataByEmail(email) : null;
  const isAuthorized = (officerPositions ?? []).some(
    (officer) =>
      officer.position !== undefined &&
      EXPORT_MEMBERS_AUTHORIZED_POSITIONS.includes(officer.position),
  );

  if (!isAuthorized) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:py-10">
      <title>Member Export - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Member Export
      </h1>
      <p className="text-center max-w-[600px]">
        Download a CSV with the name and email of every member in the club
        database.
      </p>
      {/* A plain anchor, not HeroUI's Link, which would route the click through router.push. */}
      <a
        download
        className={buttonVariants()}
        href="/api/protected/memberexport"
      >
        Download member CSV
      </a>
    </div>
  );
}
