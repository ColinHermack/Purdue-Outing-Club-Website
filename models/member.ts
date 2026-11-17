/**
 * A model of a row of the member table of the database. For use when interacting with the
 * database. JSON column keys are capitalized (Type, Expires, Verified) because that is how they are stored.
 *
 * Not imported anywhere yet; miniservices/memberMiniService.ts has its own MemberRow interface. Several columns
 * are written by Power Automate flows (docs/systems/database.md#who-writes-what), so do not rename them casually.
 *
 * @author Colin Hermack
 */

class FirstAidData {
  Type?: string;
  Expires?: string;
  Verified?: boolean;
}

class EmergencyData {
  Name?: string;
  Email?: string;
  Phone?: string;
  Relation?: string;
}

class MedicalData {
  Allergies?: string;
  Conditions?: string;
  Medications?: string;
}

export default class Member {
  id?: number;
  name?: string;
  pronouns?: string;
  email?: string;
  phone?: string;
  dues_data?: object;
  first_aid_data?: FirstAidData;
  car_data?: object;
  driver_data?: object;
  emergency_data?: EmergencyData;
  policy_agreement?: boolean;
  waiver_agreement?: boolean;
  school_year?: string;
  medical_data?: MedicalData;
  trip_count?: number;
  holds?: string;
  signup_count?: number;
  years_active?: string;
  campus?: string;
}
