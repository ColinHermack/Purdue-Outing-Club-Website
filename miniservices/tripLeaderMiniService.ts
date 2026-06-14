"use server";

/**
 * Provides database interaction for everything related to trip leaders.
 * 
 * @author Colin Hermack
 */

import TripLeaderDTO from "@/dtos/tripLeaderDto";

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
    let result: typeof QueryResult = null;
    const client = await pool.connect();

    try {
      let result = await client.query(`
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
            firstAidData: row.first_aid_data ? {
              type: row.first_aid_data.Type,
              expires: row.first_aid_data.Expires,
              verified: row.first_aid_data.Verified,
            } : null,
            carData: row.car_data,
            driverData: row.driver_data,
            emergencyData: row.emergency_data ? {
              name: row.emergency_data.Name,
              email: row.emergency_data.Email,
              phone: row.emergency_data.Phone,
              relation: row.emergency_data.Relation,
            } : null,
            policyAgreement: row.policy_agreement,
            waiverAgreement: row.waiver_agreement,
            schoolYear: row.school_year,
            medicalData: row.medical_data ? {
              allergies: row.medical_data.Allergies,
              conditions: row.medical_data.Conditions,
              medications: row.medical_data.Medications,
            } : null,
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
        }
      })
    } catch (error: any) {
      throw error;
    } finally {
      client.release();
    }
}

