/**
 * Pure helpers that turn a member's raw profile data into the statuses shown on the dashboard.
 *
 * @author Colin Hermack
 */

import type MemberDTO from "@/dtos/memberDto";

export type ExpiryStatus = "valid" | "expired" | "none";

/**
 * Whether a JSON blob with an `Expires` date (dues, first aid, driver certification) is still in date.
 *
 * @param data The raw JSON from the member row.
 * @param today Today as YYYY-MM-DD. Injectable for tests.
 * @returns valid if it expires after today, expired if it has lapsed, none if there is no usable date.
 */
export function expiryStatus(
  data: unknown,
  today: string = new Date().toLocaleDateString("en-CA"),
): ExpiryStatus {
  const expires = (data as { Expires?: unknown } | null | undefined)?.Expires;

  if (typeof expires !== "string" || expires === "") return "none";

  return expires.slice(0, 10) > today ? "valid" : "expired";
}

/**
 * The reasons a member cannot sign up for trips yet. Empty means they can.
 *
 * @param member The member profile.
 * @param today Today as YYYY-MM-DD. Injectable for tests.
 * @returns Human readable reasons, such as "Your dues expired".
 */
export function signupBlockers(member: MemberDTO, today?: string): string[] {
  const blockers: string[] = [];
  const dues = expiryStatus(member.duesData, today);

  if (dues === "expired") blockers.push("your dues expired");
  if (dues === "none") blockers.push("you haven't paid dues");
  if (!member.policyAgreement) {
    blockers.push("the club policy agreement isn't signed");
  }
  if (!member.waiverAgreement)
    blockers.push("the liability waiver isn't signed");

  return blockers;
}

/**
 * Formats a trip's dates, such as "Dec 5, 2026" or "Nov 14 to 16, 2026".
 *
 * @param start Start date as an ISO string.
 * @param end End date as an ISO string, if any.
 * @returns The formatted range.
 */
export function formatTripDates(
  start?: string | Date,
  end?: string | Date,
): string {
  if (!start) return "";

  const fmt = (d: string | Date, opts: Intl.DateTimeFormatOptions) =>
    new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  const full: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  if (!end || fmt(start, full) === fmt(end, full)) return fmt(start, full);

  const sameMonth =
    fmt(start, { month: "short", year: "numeric" }) ===
    fmt(end, { month: "short", year: "numeric" });

  return sameMonth
    ? `${fmt(start, { month: "short", day: "numeric" })} to ${fmt(end, { day: "numeric" })}, ${fmt(end, { year: "numeric" })}`
    : `${fmt(start, { month: "short", day: "numeric" })} to ${fmt(end, full)}`;
}
