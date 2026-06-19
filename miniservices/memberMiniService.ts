/**
 * Handles all database communication related to members generally.
 *
 * @author Colin Hermack
 */

"use server";

import { Pool } from "pg";

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

    return result.rows;
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
