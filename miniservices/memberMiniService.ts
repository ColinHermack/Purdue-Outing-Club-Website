/**
 * Handles all database communication related to members generally.
 *
 * @author Colin Hermack
 */

"use server";

import { Pool } from "pg";

import MemberDirectoryEntryDTO, { DuesStatus } from "@/dtos/memberDirectoryEntryDto";
import MemberDTO, { CarDataDTO, EmergencyDataDTO } from "@/dtos/memberDto";
import type { CarInput, EmergencyContactInput } from "@/utils/memberForms";

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

/** The `car_data` json column. Capacity is stored as a string. */
interface CarRow {
  Model?: string;
  Nickname?: string;
  Color?: string;
  Capacity?: string;
  Hitch?: boolean;
}

/** The `emergency_data` json column. */
interface EmergencyRow {
  Name?: string;
  Email?: string;
  Phone?: string;
  Relation?: string;
}

function mapCar(car: CarRow): CarDataDTO {
  return {
    model: car.Model,
    nickname: car.Nickname,
    color: car.Color,
    capacity: car.Capacity,
    hitch: car.Hitch,
  };
}

function mapEmergency(contact: EmergencyRow): EmergencyDataDTO {
  return {
    name: contact.Name,
    email: contact.Email,
    phone: contact.Phone,
    relation: contact.Relation,
  };
}

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
  first_aid_data: { Type?: string; Expires?: string; Verified?: boolean } | null;
  car_data: CarRow | null;
  driver_data: MemberDTO["driverData"];
  emergency_data: EmergencyRow | null;
  policy_agreement: boolean;
  waiver_agreement: boolean;
  school_year: string;
  medical_data: {
    Allergies?: string;
    Conditions?: string;
    Medications?: string;
  } | null;
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
  phone: string | null;
  is_active: boolean;
  policy_agreement: boolean;
  waiver_agreement: boolean;
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
    firstAidData: row.first_aid_data
      ? {
          type: row.first_aid_data.Type,
          expires: row.first_aid_data.Expires,
          verified: row.first_aid_data.Verified,
        }
      : undefined,
    carData: row.car_data ? mapCar(row.car_data) : undefined,
    driverData: row.driver_data,
    emergencyData: row.emergency_data
      ? mapEmergency(row.emergency_data)
      : undefined,
    policyAgreement: row.policy_agreement,
    waiverAgreement: row.waiver_agreement,
    schoolYear: row.school_year,
    medicalData: row.medical_data
      ? {
          allergies: row.medical_data.Allergies,
          conditions: row.medical_data.Conditions,
          medications: row.medical_data.Medications,
        }
      : undefined,
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
                phone,
                COALESCE(policy_agreement, false) AS policy_agreement,
                COALESCE(waiver_agreement, false) AS waiver_agreement,
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
      phone: row.phone,
      isActive: row.is_active,
      policyAgreement: row.policy_agreement,
      waiverAgreement: row.waiver_agreement,
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
 * Records a dues payment for the member with the given email (case-insensitive), creating the
 * member if no one has that email yet. `Paid` is set to today's date (database clock, YYYY-MM-DD).
 * An existing expiration later than `expires` is kept untouched, so a late or duplicate receipt
 * never shortens dues or moves the original `Paid` date.
 *
 * `member.email` has no unique constraint, so the lookup and insert run in one transaction holding
 * an advisory lock on the email. Two simultaneous payments for a new email then create one row.
 * New ids come from member_id_seq after resyncing it to max(member_id), because other tools that
 * create members set member_id themselves and leave the sequence behind.
 *
 * @param email The member's email address. New members are stored with it lowercased.
 * @param name The name to give a newly created member. Ignored for existing members.
 * @param type The dues type to record, "Annual", "Fall" or "Spring".
 * @param expires The new expiration date as YYYY-MM-DD.
 * @returns The member's resulting expiration date, and whether a new member was created.
 */
export async function recordDuesByEmail(
  email: string,
  name: string,
  type: "Annual" | "Fall" | "Spring",
  expires: string,
): Promise<{ expires: string; created: boolean }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext(lower($1)))", [
      email,
    ]);

    const updated = await client.query(
      `UPDATE member
            SET dues_data = CASE
                WHEN (dues_data ->> 'Expires')::date >= $3::date THEN dues_data
                ELSE json_build_object('Type', $2::text, 'Expires', $3::text, 'Paid', CURRENT_DATE::text)
            END
            WHERE lower(email) = lower($1)
            RETURNING dues_data ->> 'Expires' AS expires;`,
      [email, type, expires],
    );

    let created = false;

    if (updated.rows.length === 0) {
      // Other tools insert members with explicit ids and never advance member_id_seq, so catch
      // it up first. The global lock stops two inserts from syncing to the same max.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('member_id_seq'))",
      );
      await client.query(
        "SELECT setval('member_id_seq', (SELECT max(member_id) FROM member))",
      );
      await client.query(
        `INSERT INTO member (name, email, dues_data)
            VALUES ($1, lower($2), json_build_object('Type', $3::text, 'Expires', $4::text, 'Paid', CURRENT_DATE::text));`,
        [name, email, type, expires],
      );
      created = true;
    }

    await client.query("COMMIT");

    return { expires: created ? expires : updated.rows[0].expires, created };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
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

/**
 * Saves the car of the member with the given email. The new fields are merged into the stored json, so keys the
 * dashboard does not edit (such as `Color`) survive. Empty nickname or model are stored as null.
 *
 * @param email The member's email address.
 * @param car The validated car (see `parseCar`).
 * @returns The saved car, or null if no member has that email.
 */
export async function updateCarByEmail(
  email: string,
  car: CarInput,
): Promise<CarDataDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE member
            SET car_data = (COALESCE(car_data::jsonb, '{}'::jsonb) || jsonb_build_object(
                'Nickname', NULLIF($2::text, ''),
                'Model', NULLIF($3::text, ''),
                'Capacity', $4::text,
                'Hitch', $5::boolean))::json
            WHERE email = $1
            RETURNING car_data;`,
      [email, car.nickname, car.model, String(car.seats), car.hitch],
    );

    return result.rows.length ? mapCar(result.rows[0].car_data) : null;
  } finally {
    client.release();
  }
}

/**
 * Clears the car of the member with the given email.
 *
 * @param email The member's email address.
 * @returns True if a member with that email exists.
 */
export async function removeCarByEmail(email: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "UPDATE member SET car_data = NULL WHERE email = $1 RETURNING member_id",
      [email],
    );

    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Saves the emergency contact of the member with the given email, merged into the stored json like
 * `updateCarByEmail`. Empty relation or email are stored as null.
 *
 * @param email The member's email address.
 * @param contact The validated contact (see `parseEmergencyContact`).
 * @returns The saved contact, or null if no member has that email.
 */
export async function updateEmergencyContactByEmail(
  email: string,
  contact: EmergencyContactInput,
): Promise<EmergencyDataDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE member
            SET emergency_data = (COALESCE(emergency_data::jsonb, '{}'::jsonb) || jsonb_build_object(
                'Name', $2::text,
                'Relation', NULLIF($3::text, ''),
                'Phone', $4::text,
                'Email', NULLIF($5::text, '')))::json
            WHERE email = $1
            RETURNING emergency_data;`,
      [email, contact.name, contact.relation, contact.phone, contact.email],
    );

    return result.rows.length
      ? mapEmergency(result.rows[0].emergency_data)
      : null;
  } finally {
    client.release();
  }
}
