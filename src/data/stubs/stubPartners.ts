import type { Organization } from "../../models/OrganizationModel";
import type { Partner } from "../../models/PartnerModel";
import { FAKE_ORGANIZATIONS } from "./stubOrganizations";

/**
 * LocalStorage key for partner feature visibility
 */
export const PARTNER_FEATURE_VISIBLE_KEY =
  "migration-advisor:partner-feature-visible";

/**
 * Checks if the partner feature is enabled via localStorage.
 * @returns true if the feature is enabled, false otherwise
 */
export function isPartnerFeatureEnabled(): boolean {
  try {
    const item = window.localStorage.getItem(PARTNER_FEATURE_VISIBLE_KEY);
    if (item) {
      const parsed = JSON.parse(item) as { value: boolean; version: number };
      return parsed.value === true;
    }
    return false;
  } catch {
    return false;
  }
}

export const getFakePartners = () => {
  return FAKE_ORGANIZATIONS.filter(
    (organization) => organization.kind === "partner",
  ).map(organizationToPartner);
};

export const organizationToPartner = (organization: Organization): Partner => {
  return {
    ...organization,
    kind: "partner",
  };
};
