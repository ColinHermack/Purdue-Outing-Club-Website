"use server";

/**
 * Provides database interaction for everything related to trip leaders.
 *
 * @author Colin Hermack
 */

import TripLeaderDTO from "@/dtos/tripLeaderDto";
import CreateTripLeaderDTO from "@/dtos/createTripLeaderDto";
import UpdateTripLeaderDTO from "@/dtos/updateTripLeaderDto";

const { Pool, QueryResult } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Gets a list of all trip leaders
 *
 * @returns A promise that resolves to a list of trip leader DTOs
 */
export async function getAllTripLeaders(): Promise<TripLeaderDTO[]> {
  const result: typeof QueryResult = null;
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

    return result.rows.map((row: any) => {
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
        sport: row.sport,
        process: row.process,
        leadCount: row.lead_count,
        gmail: row.gmail,
      };
    });
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Gets a specific trip leader based on their member id
 *
 * @param memberId The member id corresponding to the trip leader
 */
export async function getTripLeader(memberId: number): Promise<TripLeaderDTO> {
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

    const row = result.rows[0];

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
      sport: row.sport,
      process: row.process,
      leadCount: row.lead_count,
      gmail: row.gmail,
    };
  } catch (error: any) {
    throw error;
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
      "UPDATE trip_leader SET sport = '$1', process = '{\"shadow\": $2, \"approved\": $3, \"certified\": $4}', gmail = '$5' WHERE member_id = $6;",
      [
        updatedTripLeader.sport?.concat(", "),
        updatedTripLeader.process?.shadow,
        updatedTripLeader.process?.approved,
        updatedTripLeader.process?.certified,
        updatedTripLeader.gmail,
        updatedTripLeader.memberId,
      ],
    );

    return true;
  } catch (error: any) {
    throw error;
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
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }
}
