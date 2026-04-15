/**
 * A data type object for representing a club member in code.
 * 
 * @author Colin Hermack
 */

export default class MemberDTO {
    id?: number;
    name?: string;
    pronouns?: string;
    email?: string;
    phone?: string;
    dues_data?: object;
    first_aid_data?: object;
    car_data?: object;
    driver_data?: object;
    emergency_data?: object;
    policy_agreeement?: boolean;
    waiver_agreement?: boolean;
    school_year?: string;
    medical_data?: object;
    trip_count?: number;
    holds?: string;
    signup_count?: number;
    years_active?: string;
    campus?: string;
}