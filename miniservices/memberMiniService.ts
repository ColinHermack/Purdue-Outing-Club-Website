/**
 * Handles all database communication related to members generally.
 *
 * @author Colin Hermack
 */

"use server";

import MemberDTO from "@/dtos/memberDto";
import { TripInfoT } from "@/config/types";

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

    if (result.rows.length > 0) {
      return true;
    }
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  return false;
}

export async function getMemberById(id: number): Promise<MemberDTO | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT * from member WHERE member_id = $1",
      [id],
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
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
    return null;
  } catch (error: any) {
    throw error;
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
  const retVal: { tripsLed: number; member: MemberDTO }[] = [];

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

    result.rows.map((row: any) => {
      retVal.push({
        tripsLed: row.trips_led,
        member: {
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
        },
      });
    });
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  return retVal;
}

/**
 * Get the 5 members who have attended the most trips
 * @returns An array of {number, MemberDTO} objects sorted by the number of trips
 */
export async function getMostTripsAttended(): Promise<
  { tripsAttended: number; member: MemberDTO }[]
> {
  const client = await pool.connect();
  const retVal: { tripsAttended: number; member: MemberDTO }[] = [];

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

    result.rows.map((row: any) => {
      retVal.push({
        tripsAttended: row.trips_attended,
        member: {
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
        },
      });
    });
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  return retVal;
}

/**
 * Asynchronously queries the database in order to get the user id associated with the member with the
 * email address passed to it.
 *
 * @returns A promise that resolves to the id of the member with the email address, or -1 if it does not exist.
 */
export async function getMemberId(email: string): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT member_id FROM member WHERE email = $1;",
      [email],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].member_id;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Asynchronously queries the database and gets the user's full name based on their ID number.
 *
 * @param userID The user's ID number from the database.
 * @returns A promise which resolves to a string containing the user's full name if the user is found, otherwise it
 * resolves to an empty string
 */
export async function getUserName(userID: number): Promise<string> {
  const client = await pool.connect();

  try {
    const result: typeof QueryResult = await client.query(
      "SELECT name FROM member WHERE member_id = $1",
      [userID],
    );

    if (result === null || result.rows.length === 0) {
      return "";
    } else {
      return result.rows[0].name;
    }
  } catch (error: any) {
    return "";
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the number of trips that a member has signed up for.
 *
 * @param userID The ID of the member to get the number of trips from.
 * @returns A promise that resolves to the number of trips that the member is signed up for, or -1 if the query fails.
 */
export async function getNumTripsTotal(userID: number): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT COUNT(*) FROM trip_roster WHERE member_id = $1;",
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].count;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the number of trips that a member has led.
 *
 * @param userID The ID of the member to get the number of trips from.
 * @returns A promise that resolves to the number of trips that the member has led, or -1 if the query fails.
 */
export async function getNumTripsLed(userID: number): Promise<number> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      "SELECT COUNT(*) FROM trip_roster WHERE member_id = $1 AND is_leader = true;",
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return -1;
    } else {
      return result.rows[0].count;
    }
  } catch (error: any) {
    return -1;
  } finally {
    client.release();
  }
}

/**
 * Queries the database asynchronously to get the trips that a member has signed up for.
 *
 * @param userID The ID of the member to get the trips from.
 * @returns A promise that resolves to an array of objects containing the trip's ID and name, or an empty array if the query fails.
 */
export async function getTrips(userID: number): Promise<TripInfoT[]> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `
            SELECT trip.trip_id, trip.name FROM trip_roster
            JOIN trip ON trip.trip_id = trip_roster.trip_id
            WHERE member_id=$1
            ORDER BY trip_id;`,
      [userID],
    );
    if (result === null || result.rows.length === 0) {
      return [];
    } else {
      return result.rows;
    }
  } catch (error: any) {
    return [];
  } finally {
    client.release();
  }
}

/**
 * Asynchronously queries the database to get the user's position in the club based on their ID. The method for this is
 * as follows:
 * 1. Check if the user exists in the officers table, and get their officer position if they do.
 * 2. If the user doesn't exist in the officers table, check if they exist in the trip leaders table.
 * 3. If they don't exist in either of those, then they must be a general member.
 */

export async function getUserPosition(userID: number): Promise<string> {
  const client = await pool.connect();

  try {
    const result: typeof QueryResult = await client.query(
      "SELECT * FROM officer WHERE member_id = $1",
      [userID],
    );

    if (result !== null && result.rows.length !== 0) {
      return "Officer";
    } else {
      const result = await client.query(
        "SELECT * FROM trip_leader WHERE member_id = $1",
        [userID],
      );

      if (result !== null && result.rows.length !== 0) {
        return "Trip Leader";
      } else {
        return "Member";
      }
    }
  } catch (error: any) {
    return "";
  } finally {
    client.release();
  }
}
