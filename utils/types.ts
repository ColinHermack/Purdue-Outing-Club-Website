/**
 * Data types which will be reused elsewhere in the app.
 *
 * @author Colin Hermack
 */

export type GearOfficerMetadataType = {
  imagePath: string;
  gearHours: string;
}

export type GearOfficerDataType = {
  position: string;
  officerData: GearOfficerMetadataType;
  name: string;
}

export type GearHoursDataType = {
  name: string;
  hours: string;
}

export type LeaderboardRowType = {
  name: string;
  trips: number;
};

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
