import type { Identity, IdentityKind } from "../../models/IdentityModel";
import { PARTNER_1, RED_HAT } from "./stubOrganizations";

/**
 * LocalStorage key for partner feature role
 */

export const PARTNER_FEATURE_ROLE_KEY =
  "migration-advisor:partner-feature-role";

/**
 * Gets the user kind from localStorage, or initializes it to "regular" as default
 */
function getUserKindFromStorage(): IdentityKind {
  try {
    const storedKind = window.localStorage.getItem(PARTNER_FEATURE_ROLE_KEY);
    if (storedKind && isValidUserKind(storedKind)) {
      return storedKind;
    }
    // Initialize to "regular" if not set
    const defaultKind: IdentityKind = "regular";
    window.localStorage.setItem(PARTNER_FEATURE_ROLE_KEY, defaultKind);
    return defaultKind;
  } catch {
    return "regular";
  }
}
/**
 * Type guard to check if a string is a valid UserKind
 */
function isValidUserKind(value: string): value is IdentityKind {
  return ["admin", "customer", "regular", "partner"].includes(value);
}

// User dictionary with all user types
const FAKE_IDENTITIES: Record<IdentityKind, Identity> = {
  admin: {
    username: "admin-1",
    kind: "admin",
    organizationId: RED_HAT.id,
    partnerId: null,
  },
  partner: {
    username: "partner-1",
    kind: "partner",
    organizationId: PARTNER_1.id,
    partnerId: null,
  },
  customer: {
    username: "",
    kind: "customer",
    organizationId: "organization-customer-1",
    partnerId: PARTNER_1.id,
  },
  regular: {
    username: "",
    kind: "regular",
    organizationId: "organization-regular-1",
    partnerId: null,
  },
};

// Helper to create a stubbed identity
export const getFakeIdentity = (kind?: IdentityKind): Identity => {
  const identityKind: IdentityKind = kind ?? getUserKindFromStorage();
  return {
    ...FAKE_IDENTITIES[identityKind],
  };
};
