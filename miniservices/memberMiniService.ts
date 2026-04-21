/**
 * Handles all database communication related to members generally.
 * 
 * @author Colin Hermack
 */

"use server"

import MemberDTO from "@/dtos/memberDto";

const { Pool } = require("pg");

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
 * Checks whether a user exists in the database
 * @param email The user's email address
 * @returns A promise resolving to true if they exist, false otherwise
 */
export async function verifyMembershipByEmail(email: string): Promise<boolean> {
    const client = await pool.connect();

    try {
        let result = await client.query("SELECT * FROM member WHERE email = $1", [email]);
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

/**
 * Gets the top 5 of the trips led leaderboard
 * @returns A promise resolving to a sorted array of objects representing the 5 members who have led the most
 * trips and the number of trips they led
 */
export async function getMostTripsLed(): Promise<{ tripsLed: number, member: MemberDTO }[]> {
    const client = await pool.connect();
    let retVal: {tripsLed: number, member: MemberDTO}[] = [];

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
                    dues_data: row.dues_data,
                    first_aid_data: row.first_aid_data,
                    car_data: row.car_data,
                    driver_data: row.driver_data,
                    emergency_data: row.emergency_data,
                    policy_agreeement: row.policy_agreement,
                    waiver_agreement: row.waiver_agreement,
                    school_year: row.school_year,
                    medical_data: row.medical_data,
                    trip_count: row.trip_count,
                    holds: row.holds,
                    signup_count: row.signup_count,
                    years_active: row.years_active,
                    campus: row.campus
                }
            })
        })
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
export async function getMostTripsAttended(): Promise<{ tripsAttended: number, member: MemberDTO}[]> {
    const client = await pool.connect();
    let retVal: {tripsAttended: number, member: MemberDTO}[] = [];

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
                    dues_data: row.dues_data,
                    first_aid_data: row.first_aid_data,
                    car_data: row.car_data,
                    driver_data: row.driver_data,
                    emergency_data: row.emergency_data,
                    policy_agreeement: row.policy_agreement,
                    waiver_agreement: row.waiver_agreement,
                    school_year: row.school_year,
                    medical_data: row.medical_data,
                    trip_count: row.trip_count,
                    holds: row.holds,
                    signup_count: row.signup_count,
                    years_active: row.years_active,
                    campus: row.campus
                }
            })
        });
    } catch (error: any) {
        throw error;
    } finally {
        client.release();
    }

    return retVal;
}