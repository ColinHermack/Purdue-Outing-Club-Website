/**
 * Server-side helper that decides what a signed-in email may do. Sign-in is currently limited to officers and trip
 * leaders; to open it to every member, change `canSignIn` to return `access.isMember`.
 *
 * @author Colin Hermack
 */

import {
  EXPORT_MEMBERS_AUTHORIZED_POSITIONS,
  GET_TRIP_LEADERS_AUTHORIZED_POSITIONS,
} from "@/config/permissions";
import type { AccountToolId } from "@/config/site";
import { getMemberByEmail } from "@/miniservices/memberMiniService";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import { getTripLeader } from "@/miniservices/tripLeaderMiniService";

export type MemberAccess = {
  isMember: boolean;
  isOfficer: boolean;
  isTripLeader: boolean;
  name?: string;
  tools: AccountToolId[];
};

/**
 * Looks up a member's officer and trip leader roles and the account menu tools those roles unlock.
 *
 * @param email The member's Purdue email.
 * @returns The member's access.
 */
export async function getMemberAccess(email: string): Promise<MemberAccess> {
  const member = await getMemberByEmail(email);

  if (member === null || member.id === undefined) {
    return {
      isMember: false,
      isOfficer: false,
      isTripLeader: false,
      tools: [],
    };
  }

  const officerRoles = (await getOfficerDataByEmail(email)) ?? [];
  const isTripLeader = (await getTripLeader(member.id)) !== null;
  const hasPosition = (allowed: string[]) =>
    officerRoles.some(
      (o) => o.position !== undefined && allowed.includes(o.position),
    );
  const tools: AccountToolId[] = [];

  if (hasPosition(GET_TRIP_LEADERS_AUTHORIZED_POSITIONS))
    tools.push("tripLeaderDashboard");
  if (isTripLeader) tools.push("memberDirectory");
  if (hasPosition(EXPORT_MEMBERS_AUTHORIZED_POSITIONS))
    tools.push("memberExport");

  return {
    isMember: true,
    isOfficer: officerRoles.length > 0,
    isTripLeader,
    name: member.name,
    tools,
  };
}

/**
 * Whether this access level may sign in right now.
 *
 * @param access The result of `getMemberAccess`.
 * @returns True if the member is an officer or trip leader.
 */
export function canSignIn(access: MemberAccess): boolean {
  return access.isMember && (access.isOfficer || access.isTripLeader);
}
