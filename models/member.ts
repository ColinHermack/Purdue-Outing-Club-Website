/**
 * A model of a row of the member table of the database. For use when interacting with the
 * database.
 * 
 * @author Colin Hermack
 */

export default class Member {
    id?: number;
    name?: string;
    pronouns?: string;
    email?: string;
    phone?: string;
    duesData?: object;
    firstAidData?: object;
    carData?: object;
    driverData?: object;
    emergencyData?: object;
    policyAgreement?: boolean;
    waiverAgreement?: boolean;
    schoolYear?: string;
    medicalData?: object;
    tripCount?: number;
    holds?: string;
    signupCount?: number;
    yearsActive?: string;
    campus?: string;
}