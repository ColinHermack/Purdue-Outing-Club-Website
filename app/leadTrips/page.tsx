/**
 * Checklist of steps a trip leader needs to take in order to lead a trip.
 *
 * Access is restricted to signed-in trip leaders (and officers). The role check runs here, server-side:
 * anyone who isn't a trip leader is shown a message directing them to become one first.
 *
 * @author Eli Orlov
 */

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getMemberId, getUserPosition } from "@/miniservices/memberMiniService";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

export default async function LeadATripPage() {
  const session = await getServerSession(authOptions);

  // Work out the logged-in user's position. Default to "not a leader".
  let isTripLeader = false;

  if (session && session.user && typeof session.user.email === "string") {
    const userID: number = await getMemberId(session.user.email);
    if (userID !== -1) {
      const position: string = await getUserPosition(userID);
      // Officers can lead trips too, so they also get access.
      if (position === "Trip Leader" || position === "Officer") {
        isTripLeader = true;
      }
    }
  }

  // Not a trip leader (or not logged in): show the "become a leader first" message.
  if (!isTripLeader) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 md:py-10">
        <title>How to Lead a Trip - Purdue Outing Club</title>
        <h1 className="text-5xl text-amber-400 font-bold text-center">
          How to Lead a Trip
        </h1>
        <Divider className="my-5" />
        <p className="text-center max-w-full">
          To lead a trip, you must first become a trip leader. You can learn how
          to become one on the{" "}
          <Link className="text-amber-400" href="/tripleaders">
            trip leaders page
          </Link>
          .
        </p>
      </div>
    );
  }

  // The user is a trip leader (or officer): show the checklist.
  return (
    <div className="flex flex-col items-center justify-center gap-4 md:py-10">
      <title>How to Lead a Trip - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        How to Lead a Trip
      </h1>
      <Divider className="my-5" />
      {/* TODO: Add the steps to lead a trip here */}
      <p className="text-center max-w-full"></p>
    </div>
  );
}
