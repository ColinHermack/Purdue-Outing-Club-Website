/**
 * A data type object for representing a club member in code.
 *
 * @author Colin Hermack
 */

class FirstAidDataDTO {
  type?: string;
  expires?: string;
  verified?: boolean;
}

export class EmergencyDataDTO {
  name?: string;
  email?: string;
  phone?: string;
  relation?: string;
}

export class CarDataDTO {
  model?: string;
  nickname?: string;
  color?: string;
  capacity?: string;
  hitch?: boolean;
}

class MedicalDataDTO {
  allergies?: string;
  conditions?: string;
  medications?: string;
}

export default class MemberDTO {
  id?: number;
  name?: string;
  pronouns?: string;
  email?: string;
  phone?: string;
  duesData?: object;
  firstAidData?: FirstAidDataDTO;
  carData?: CarDataDTO;
  driverData?: object;
  emergencyData?: EmergencyDataDTO;
  policyAgreement?: boolean;
  waiverAgreement?: boolean;
  schoolYear?: string;
  medicalData?: MedicalDataDTO;
  tripCount?: number;
  holds?: string;
  signupCount?: number;
  yearsActive?: string;
  campus?: string;
}
