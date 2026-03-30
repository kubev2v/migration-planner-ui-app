import type { Organization } from "./OrganizationModel";

export type PartnerRequestStatus = "pending" | "rejected";

export interface PartnerRequest {
  id: string;
  status: PartnerRequestStatus;
  statusReason: string;
  organization: Organization;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRequestValues {
  partnerId: string;
  customerName: string;
  customerPointOfContactName: string;
  contactPhone: string;
  email: string;
  vcenterGeoLocation: string;
}

export interface PartnerRequestCreate {
  username: string;
  request: PartnerRequestValues;
}
