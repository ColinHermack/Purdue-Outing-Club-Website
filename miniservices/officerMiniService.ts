/**
 * Handles all database communication related to officers.
 * 
 * @author Colin Hermack
 */

"use server"

import { LEADERSHIP_CATEGORIES } from '@/config/constants';
import OfficerDTO from '@/dtos/officerDto';
import { GearHoursDataT } from '@/config/types';

const { Pool, QueryResult } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
})

/**
 * Gets data for all officers.
 * @returns A promise resolving to a list of objects representing each category of officer.
 */
export async function getAllOfficerData(): Promise<{label: string, content: OfficerDTO[]}[]> {
    let retVal: {label: string, content: OfficerDTO[]}[] = LEADERSHIP_CATEGORIES.map((category) => {
        return {
            label: category.branch,
            content: []
        }
    })

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
                JOIN member AS m ON m.member_id = o.officer_id`
        );

        for (let i = 0; i < LEADERSHIP_CATEGORIES.length; i++) {
            for (let j = 0; j < LEADERSHIP_CATEGORIES[i].positions.length; j++) {
                for (let k = 0; k < result.rows.length; k++) {
                    if (result.rows[k].position === LEADERSHIP_CATEGORIES[i].positions[j]) {
                        retVal[i].content.push({
                            member: {
                                id: result.rows[k].member_id,
                                name: result.rows[k].name,
                                pronouns: result.rows[k].pronouns,
                                email: result.rows[k].email,
                                phone: result.rows[k].phone,
                                dues_data: result.rows[k].dues_data,
                                first_aid_data: result.rows[k].first_aid_data,
                                car_data: result.rows[k].car_data,
                                driver_data: result.rows[k].driver_data,
                                emergency_data: result.rows[k].emergency_data,
                                policy_agreeement: result.rows[k].policy_agreement,
                                waiver_agreement: result.rows[k].waiver_agreement,
                                school_year: result.rows[k].school_year,
                                medical_data: result.rows[k].medical_data,
                                trip_count: result.rows[k].trip_count,
                                holds: result.rows[k].holds,
                                signup_count: result.rows[k].signup_count,
                                years_active: result.rows[k].years_active,
                                campus: result.rows[k].campus
                            },
                            position: result.rows[k].position,
                            year: result.rows[k].year,
                            officer_data: result.rows[k].officer_data
                        })
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
export async function getOfficerDataByPosition(position: string): Promise<OfficerDTO[] | null> {
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
            [position]
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