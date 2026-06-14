/**
 * Handles all database communication related to officers.
 *
 * @author Colin Hermack
 */

"use server";

import { LEADERSHIP_CATEGORIES } from "@/config/constants";
import OfficerDTO from "@/dtos/officerDto";
import { GearHoursDataT } from "@/config/types";
import { Officer, BranchData } from "@/utils/leadership";

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
 * Gets data for all officers.
 * @returns A promise resolving to a list of objects representing each category of officer.
 */
export async function getAllOfficerData(): Promise<{ label: string; content: OfficerDTO[] }[]> {
  let retVal: { label: string; content: OfficerDTO[] }[] =
    LEADERSHIP_CATEGORIES.map((category) => {
      return {
        label: category.branch,
        content: [],
      };
    });

  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT m.member_id,
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
                    o.position,
                    o.year,
                    o.officer_data
                FROM officer AS o
                JOIN member AS m ON m.member_id = o.officer_id`,
    );

    for (let i = 0; i < LEADERSHIP_CATEGORIES.length; i++) {
      for (let j = 0; j < LEADERSHIP_CATEGORIES[i].positions.length; j++) {
        for (let k = 0; k < result.rows.length; k++) {
          if (
            result.rows[k].position === LEADERSHIP_CATEGORIES[i].positions[j]
          ) {
            retVal[i].content.push({
              member: {
                id: result.rows[k].member_id,
                name: result.rows[k].name,
                pronouns: result.rows[k].pronouns,
                email: result.rows[k].email,
                phone: result.rows[k].phone,
                duesData: result.rows[k].dues_data,
                firstAidData: result.rows[k].first_aid_data,
                carData: result.rows[k].car_data,
                driverData: result.rows[k].driver_data,
                emergencyData: result.rows[k].emergency_data,
                policyAgreement: result.rows[k].policy_agreement,
                waiverAgreement: result.rows[k].waiver_agreement,
                schoolYear: result.rows[k].school_year,
                medicalData: result.rows[k].medical_data,
                tripCount: result.rows[k].trip_count,
                holds: result.rows[k].holds,
                signupCount: result.rows[k].signup_count,
                yearsActive: result.rows[k].years_active,
                campus: result.rows[k].campus,
              },
              position: result.rows[k].position,
              year: result.rows[k].year,
              officerData: result.rows[k].officer_data,
            });
          }
        }
      }
    }
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  return retVal;
}

/**
 * Retrieves an officer's information based on their position.
 * @param position: a string indicating the name of the officer's position
 * @returns A promise resolving to an array of officer DTOs who hold that position
 */
export async function getOfficerDataByPosition(
  position: string,
): Promise<OfficerDTO[] | null> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT m.member_id,
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
                    o.position,
                    o.year,
                    o.officer_data
                FROM officer AS o
                JOIN member AS m ON m.member_id = o.officer_id
                WHERE officer.position = $1`,
      [position],
    );
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  if (result === null || result.rows.length === 0) {
    return null;
  }

  return result.rows;
}

/**
 * Retrieves an officer's information based on their email address.
 * @param email a string containing the officer's email address
 * @returns A promise resolving to an array of officer DTOs for the member with that email, or null if not found
 */
export async function getOfficerDataByEmail(
  email: string,
): Promise<OfficerDTO[] | null> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT m.member_id,
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
                    o.position,
                    o.year,
                    o.officer_data
                FROM officer AS o
                JOIN member AS m ON m.member_id = o.member_id
                WHERE m.email = $1`,
      [email],
    );
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }

  if (result === null || result.rows.length === 0) {
    return null;
  }

  return result.rows.map((row: any) => ({
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
    position: row.position,
    year: row.year,
    officerData: row.officer_data,
  }));
}

/**
 * Gets gear hours
 * @returns A promise that resolves to an array of GearHoursDataT type
 */
export async function getGearHours(): Promise<GearHoursDataT[]> {
  const client = await pool.connect();

  try {
    let result = await client.query(`
            SELECT m.name, o.officer_data->'GearHours' AS gearHours FROM officer AS o
            JOIN member AS m ON m.member_id = o.member_id
            WHERE position LIKE '%Gear%';`);

    return result.rows;
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Retrieves the officer data for a given position.
 *
 * @param position The position to retrieve officer data for.
 * @returns An object containing the officer data for the given position, or undefined if the position does not exist.
 */
export async function getLeaderDataByPosition(
  position: string,
): Promise<Officer | undefined> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT officer.position,
                officer.officer_data AS "officerData",
                member.name,
                member.email,
                member.pronouns,
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id
            WHERE officer.position = $1;`,
      [position],
    );
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }

  if (result === null || result.rows.length === 0) {
    return undefined;
  } else {
    return result.rows[0];
  }
}

/**
 * Retrieves all officer data, organized by branch.
 *
 * @returns An array of objects, each representing a branch of the club. Each object contains a label and an array of
 *          Officer objects, containing the officer data for each officer in the branch.
 */
export async function getLeaderData() {
  let allData: BranchData[] = [
    {
      label: "Executive",
      content: [],
    },
    {
      label: "Administrative",
      content: [],
    },
    {
      label: "Operations",
      content: [],
    },
    {
      label: "Outreach",
      content: [],
    },
    {
      label: "Event Planning",
      content: [],
    },
    {
      label: "Backpacking",
      content: [],
    },
    {
      label: "Canoeing",
      content: [],
    },
    {
      label: "Caving",
      content: [],
    },
    {
      label: "Climbing",
      content: [],
    },
    {
      label: "Fishing",
      content: [],
    },
    {
      label: "Mountain Biking",
      content: [],
    },
    {
      label: "Whitewater",
      content: [],
    },
    {
      label: "Winter Sports",
      content: [],
    },
    {
      label: "Gear",
      content: [],
    },
    {
      label: "Advisors",
      content: [],
    },
  ];

  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT officer.position,
                officer.officer_data AS "officerData",
                member.name,
                member.email,
                member.pronouns,
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id`,
    );
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }

  for (let i = 0; i < LEADERSHIP_CATEGORIES.length; i++) {
    for (let j = 0; j < LEADERSHIP_CATEGORIES[i].positions.length; j++) {
      for (let k = 0; k < result.rows.length; k++) {
        if (result.rows[k].position === LEADERSHIP_CATEGORIES[i].positions[j]) {
          allData[i].content.push(result.rows[k]);
        }
      }
    }
  }

  return allData;
}

