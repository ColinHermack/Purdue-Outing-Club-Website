"use server";

/**
 * Provides database interaction for everything related to trip leaders.
 *
 * @author Colin Hermack
 */

import { Pool } from "pg";

import TripLeaderDTO from "@/dtos/tripLeaderDto";
import MemberDTO from "@/dtos/memberDto";
import CreateTripLeaderDTO from "@/dtos/createTripLeaderDto";
import UpdateTripLeaderDTO from "@/dtos/updateTripLeaderDto";

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
 * The shape of a `trip_leader` JOIN `member` row as returned by the database. The jsonb member
 * columns use capitalized keys, which are normalized to camelCase by mapTripLeaderRow.
 */
interface TripLeaderJoinRow {
  member_id: number;
  name: string;
  pronouns: string;
  email: string;
  phone: string;
  dues_data: MemberDTO["duesData"];
  first_aid_data: {
    Type?: string;
    Expires?: string;
    Verified?: boolean;
  } | null;
  car_data: MemberDTO["carData"];
  driver_data: MemberDTO["driverData"];
  emergency_data: {
    Name?: string;
    Email?: string;
    Phone?: string;
    Relation?: string;
  } | null;
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
  sport: string;
  process: TripLeaderDTO["process"];
  lead_count: number;
  gmail: string;
}

/**
 * Maps a raw `trip_leader` JOIN `member` row into a TripLeaderDTO (snake_case -> camelCase).
 *
 * @param row A joined trip leader / member row.
 * @returns The equivalent TripLeaderDTO.
 */
function mapTripLeaderRow(row: TripLeaderJoinRow): TripLeaderDTO {
  return {
    member: {
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
      carData: row.car_data,
      driverData: row.driver_data,
      emergencyData: row.emergency_data
        ? {
            name: row.emergency_data.Name,
            email: row.emergency_data.Email,
            phone: row.emergency_data.Phone,
            relation: row.emergency_data.Relation,
          }
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
    },
    sport: row.sport.split(', '),
    process: row.process,
    leadCount: row.lead_count,
    gmail: row.gmail,
  };
}

/**
 * Gets a list of all trip leaders
 *
 * @returns A promise that resolves to a list of trip leader DTOs
 */
export async function getAllTripLeaders(): Promise<TripLeaderDTO[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
        SELECT
          m.member_id,
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
          t.sport,
          t.process,
          t.lead_count,
          t.gmail
        FROM trip_leader AS t
        JOIN member AS m ON t.member_id = m.member_id
        ORDER BY m.name;
      `);

    return result.rows.map((row: TripLeaderJoinRow) => mapTripLeaderRow(row));
  } finally {
    client.release();
  }
}

/**
 * Gets a specific trip leader based on their member id
 *
 * @param memberId The member id corresponding to the trip leader
 * @returns A promise that resolves to the trip leader DTO, or null if no such trip leader exists.
 */
export async function getTripLeader(
  memberId: number,
): Promise<TripLeaderDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT
          m.member_id,
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
          t.sport,
          t.process,
          t.lead_count,
          t.gmail
        FROM trip_leader AS t
        JOIN member AS m ON t.member_id = m.member_id
        WHERE m.member_id = $1;
      `,
      [memberId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapTripLeaderRow(result.rows[0] as TripLeaderJoinRow);
  } finally {
    client.release();
  }
}

/**
 * Updates an existing entry in the trip leader table of the database.
 *
 * @param updatedTripLeader Data for the updated trip leader entry
 */
export async function updateTripLeader(
  updatedTripLeader: UpdateTripLeaderDTO,
): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query(
      "UPDATE trip_leader SET sport = $1, process = jsonb_build_object('shadow', $2::boolean, 'approved', $3::boolean, 'certified', $4::boolean), gmail = $5 WHERE member_id = $6;",
      [
        updatedTripLeader.sport?.join(", "),
        updatedTripLeader.process?.shadow,
        updatedTripLeader.process?.approved,
        updatedTripLeader.process?.certified,
        updatedTripLeader.gmail,
        updatedTripLeader.memberId,
      ],
    );

    return true;
  } catch (error: unknown)  {
    console.error(error);
    return false;
  } finally {
    client.release();
  }

}

/**
 * Creates a new entry in the trip leader table of the database.
 *
 * @param newTripLeader Data for the new trip leader entry
 */
export async function createTripLeader(
  newTripLeader: CreateTripLeaderDTO,
): Promise<boolean> {
  const client = await pool.connect();

  try {
    // TODO: This statement is broken and needs to be fixed manually. The parameter placeholders are
    // wrapped in single quotes (e.g. '$2'), so Postgres treats them as literal strings rather than
    // bound parameters, and the process object is built via string interpolation instead of a proper
    // jsonb value. Rewrite using unquoted placeholders and jsonb_build_object.
    await client.query(
      "INSERT INTO trip_leader VALUES ($1, '$2', '{\"shadow\": $3, \"approved\": $4, \"certified\": $5}', 0, '$6');",
      [
        newTripLeader.memberId,
        newTripLeader.sport?.concat(", "),
        newTripLeader.process?.shadow,
        newTripLeader.process?.approved,
        newTripLeader.process?.certified,
        newTripLeader.gmail,
      ],
    );

    return true;
  } finally {
    client.release();
  }
}
