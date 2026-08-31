/**
 * A flat data type object for the trip leader member directory. Carries only the fields trip
 * leaders need when planning a trip; emergency contact and medical data are deliberately excluded
 * so they can never be serialized by the directory endpoint.
 *
 * @author Colin Hermack
 */

export type DuesStatus = "paid" | "expired" | "none";

export default class MemberDirectoryEntryDTO {
  id?: number;
  name?: string;
  pronouns?: string;
  email?: string;
  phone?: string | null;
  isActive?: boolean;
  policyAgreement?: boolean;
  waiverAgreement?: boolean;
  duesStatus?: DuesStatus;
  firstAidType?: string | null;
  carCapacity?: string | null;
  carHitch?: boolean;
  driverCertified?: boolean;
}
