/**
 * Officer position titles allowed to use each protected feature. Protected API routes (and server pages such as
 * /memberexport) look up the signed-in user's rows in the `officer` table with getOfficerDataByEmail and allow the
 * request if any `officer.position` appears in the relevant list.
 *
 * Titles are compared with `includes`, so they must match `officer.position` exactly, including case, spacing and
 * "&". When a position is renamed in the database, update it here too or that officer loses access. Add a new
 * constant for each new feature instead of reusing one or listing titles inside a route.
 *
 * @author Colin Hermack
 */

/** May list, create and edit trip leaders (/tripleadersdashboard, /api/protected/tripleaders). */
export const GET_TRIP_LEADERS_AUTHORIZED_POSITIONS = [
  "President",
  "Vice President",
  "Secretary of Sports",
  "Webmaster",
];

/** May download every member's name and email as CSV (/memberexport, /api/protected/memberexport). */
export const EXPORT_MEMBERS_AUTHORIZED_POSITIONS = [
  "Gear Lord",
  "Secretary of Operations",
  "Webmaster",
];
