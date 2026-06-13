/**
 * Utilities related to fetching leadership data from the database.
 * @author Colin Hermack
 */

export interface OfficerData {
  ImagePath: string;
  GearHours?: string;
}

export interface Officer {
  position: string;
  officerData: OfficerData;
  name: string;
  email: string;
  pronouns: string;
  phone: string;
}

export interface BranchData {
  label: string;
  content: Officer[];
}
