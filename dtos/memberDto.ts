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