/**
 * Data types which will be reused elsewhere in the app.
 *
 * @author Colin Hermack
 */

/** One gear officer's open hours, as returned by GET /api/gear/hours and shown on /gearcloset. */
export type GearHoursDataT = {
  name: string;
  hours: string;
};
