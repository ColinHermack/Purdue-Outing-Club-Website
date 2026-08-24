/**
 * Handles all database communication related to members generally.
 *
 * @author Colin Hermack
 */

"use server";

import { Pool } from "pg";

import MemberDirectoryEntryDTO, { DuesStatus } from "@/dtos/memberDirectoryEntryDto";
import MemberDTO from "@/dtos/memberDto";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * The shape of a `member` table row as returned by the database (snake_case columns).
 */
interface MemberRow {
  member_id: number;
  name: string;
  pronouns: string;
  email: string;
  phone: string;
  dues_data: MemberDTO["duesData"];
  first_aid_data: MemberDTO["firstAidData"];
  car_data: MemberDTO["carData"];
  driver_data: MemberDTO["driverData"];
  emergency_data: MemberDTO["emergencyData"];
  policy_agreement: boolean;
  waiver_agreement: boolean;
  school_year: string;
  medical_data: MemberDTO["medicalData"];
  trip_count: number;
  holds: string;
  signup_count: number;
  years_active: string;
  campus: string;
}

/**
 * The shape of a member directory row as returned by the database. The status fields are derived
 * in SQL rather than stored, so they have no counterpart on the member table itself.
 */
interface MemberDirectoryRow {
  member_id: number;
  name: string;
  pronouns: string;
  email: string;
  is_active: boolean;
  dues_status: DuesStatus;
  first_aid_type: string | null;
  car_capacity: string | null;
  car_hitch: boolean;
  driver_certified: boolean;
}

/**
 * Maps a raw `member` row from the database into a MemberDTO (snake_case -> camelCase).
 *
 * @param row A row from the member table.
 * @returns The equivalent MemberDTO.
 */
function mapMemberRow(row: MemberRow): MemberDTO {
  return {
    id: row.member_id,
    name: row.name,
    pronouns: row.pronouns,
    email: row.email,
    phone: row.phone,
    duesData: row.dues_data,
    firstAidData: row.first_aid_data,
    carData: row.car_data,
    driverData: row.driver_data,
    emergencyData: row.emergency_data,
    policyAgreement: row.policy_agreement,
    waiverAgreement: row.waiver_agreement,
    schoolYear: row.school_year,
    medicalData: row.medical_data,
    tripCount: row.trip_count,
    holds: row.holds,
    signupCount: row.signup_count,
    yearsActive: row.years_active,
    campus: row.campus,
  };
}

/**
 * Returns a list of all members in the club.
 * 
 * @returns A list of MemberDTO objects
 */
export async function getMembers(): Promise<MemberDTO[]> {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM member");

    return result.rows.map((row: MemberRow) => mapMemberRow(row));
  } finally {
    client.release();
  }
}

/**
 * Returns every member alongside the trip-planning fields the member directory displays.
 *
 * All status derivation happens in SQL so the date comparisons run against the database's
 * CURRENT_DATE rather than the client's clock, and so the "active" rule stays identical to the
 * one already encoded in the all_members view (dues unexpired, both agreements signed, no holds).
 * The club's own poc@purdue.edu account is excluded, as both the active_members and all_members
 * views do, since it is a service account rather than a person.
 *
 * @returns A promise resolving to a list of MemberDirectoryEntryDTO objects, sorted by name.
 */
export async function getMemberDirectory(): Promise<MemberDirectoryEntryDTO[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
            SELECT member_id,
                name,
                pronouns,
                email,
                COALESCE(
                    (dues_data ->> 'Expires')::date > CURRENT_DATE
                        AND waiver_agreement = true
                        AND policy_agreement = true
                        AND holds IS NULL,
                    false
                ) AS is_active,
                CASE
                    WHEN dues_data IS NULL THEN 'none'
                    WHEN (dues_data ->> 'Expires')::date > CURRENT_DATE THEN 'paid'
                    ELSE 'expired'
                END AS dues_status,
                CASE
                    WHEN (first_aid_data ->> 'Expires')::date > CURRENT_DATE
                        THEN first_aid_data ->> 'Type'
                END AS first_aid_type,
                car_data ->> 'Capacity' AS car_capacity,
                COALESCE((car_data ->> 'Hitch')::boolean, false) AS car_hitch,
                COALESCE((driver_data ->> 'Expires')::date > CURRENT_DATE, false) AS driver_certified
            FROM member
            WHERE email <> 'poc@purdue.edu'
            ORDER BY name;`);

    return result.rows.map((row: MemberDirectoryRow) => ({
      id: row.member_id,
      name: row.name,
      pronouns: row.pronouns,
      email: row.email,
      isActive: row.is_active,
      duesStatus: row.dues_status,
      firstAidType: row.first_aid_type,
      carCapacity: row.car_capacity,
      carHitch: row.car_hitch,
      driverCertified: row.driver_certified,
    }));
  } finally {
    client.release();
  }
}

/**
 * Checks whether a user exists in the database
 * @param email The user's email address
 * @returns A promise resolving to true if they exist, false otherwise
 */
export async function verifyMembershipByEmail(email: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM member WHERE email = $1", [
      email,
    ]);

    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Gets the member with the given id.
 * @param id The member's id
 * @returns A promise resolving to the MemberDTO, or null if no such member exists.
 */
export async function getMemberById(id: number): Promise<MemberDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT * from member WHERE member_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapMemberRow(result.rows[0] as MemberRow);
  } finally {
    client.release();
  }
}

/**
 * Gets the top 5 of the trips led leaderboard
 * @returns A promise resolving to a sorted array of objects representing the 5 members who have led the most
 * trips and the number of trips they led
 */
export async function getMostTripsLed(): Promise<
  { tripsLed: number; member: MemberDTO }[]
> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
            SELECT m.member_id,
                m.name,
                m.pronouns,
                m.email,
                m.phone,
                m.dues_data,
                m.first_aid_data,
                m.car_data,
                m.driver_data,
                m.emergency_data,
                m.policy_agreement,
                m.waiver_agreement,
                m.school_year,
                m.medical_data,
                m.trip_count,
                m.holds,
                m.signup_count,
                m.years_active,
                m.campus,
            (SELECT COUNT(*) FROM trip_roster WHERE trip_roster.member_id = m.member_id AND trip_roster.is_leader = TRUE) AS trips_led
            FROM member AS m
            JOIN trip_roster AS t ON m.member_id = t.member_id
            GROUP BY m.member_id
            ORDER BY trips_led DESC
            LIMIT 5;`);

    return result.rows.map((row: MemberRow & { trips_led: number }) => ({
      tripsLed: row.trips_led,
      member: mapMemberRow(row),
    }));
  } finally {
    client.release();
  }
}

/**
 * Get the 5 members who have attended the most trips
 * @returns An array of {number, MemberDTO} objects sorted by the number of trips
 */
export async function getMostTripsAttended(): Promise<
  { tripsAttended: number; member: MemberDTO }[]
> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
            SELECT m.member_id,
            m.name,
            m.pronouns,
            m.email,
            m.phone,
            m.dues_data,
            m.first_aid_data,
            m.car_data,
            m.driver_data,
            m.emergency_data,
            m.policy_agreement,
            m.waiver_agreement,
            m.school_year,
            m.medical_data,
            m.trip_count,
            m.holds,
            m.signup_count,
            m.years_active,
            m.campus,
        (SELECT COUNT(*) FROM trip_roster WHERE trip_roster.member_id = m.member_id) AS trips_attended
        FROM member AS m
        JOIN trip_roster AS t ON m.member_id = t.member_id
        GROUP BY m.member_id
        ORDER BY trips_attended DESC
        LIMIT 5;`);

    return result.rows.map((row: MemberRow & { trips_attended: number }) => ({
      tripsAttended: row.trips_attended,
      member: mapMemberRow(row),
    }));
  } finally {
    client.release();
  }
}

/**
 * Gets the user specified by a purdue email address
 * @param email The user's purdue email
 * @returns A MemberDTO object, or null if no such member exists.
 */
export async function getMemberByEmail(
  email: string,
): Promise<MemberDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM member WHERE email=$1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return mapMemberRow(result.rows[0] as MemberRow);
  } finally {
    client.release();
  }
}
