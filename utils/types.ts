/**
 * Data types which will be reused elsewhere in the app.
 *
 * @author Colin Hermack
 */

export type TripInfoT = {
  trip_id: string;
  name: number;
};

export type MemberStatsT = {
  name: string;
  position: string;
  num_trips_total: number;
  num_trips_led: number;
  trips: TripInfoT[];
};
