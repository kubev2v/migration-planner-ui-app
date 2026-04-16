import type {
  Identity,
  IdentityKindEnum,
} from "@openshift-migration-advisor/planner-sdk";

import { PARTNER_1, RED_HAT } from "./stubGroups";

/**
 * LocalStorage key for partner feature role
 */

export const PARTNER_FEATURE_ROLE_KEY =
  "migration-advisor:partner-feature-role";

/**
 * Gets the user kind from localStorage, or initializes it to "regular" as default
 */
function getUserKindFromStorage(): IdentityKindEnum {
  try {
    const storedKind = window.localStorage.getItem(PARTNER_FEATURE_ROLE_KEY);
    if (storedKind && isValidUserKind(storedKind)) {
      return storedKind;
    }
    // Initialize to "regular" if not set
    const defaultKind: IdentityKindEnum = "regular";
    window.localStorage.setItem(PARTNER_FEATURE_ROLE_KEY, defaultKind);
    return defaultKind;
  } catch {
    return "regular";
  }
}
/**
 * Type guard to check if a string is a valid UserKind
 */
function isValidUserKind(value: string): value is IdentityKindEnum {
  return ["admin", "customer", "regular", "partner"].includes(value);
}

// User dictionary with all user types
const FAKE_IDENTITIES: Record<IdentityKindEnum, Identity> = {
  admin: {
    username: "admin-1",
    kind: "admin",
    groupId: RED_HAT.id,
    partnerId: null,
  },
  partner: {
    username: "partner-1",
    kind: "partner",
    groupId: PARTNER_1.id,
    partnerId: null,
  },
  customer: {
    username: "",
    kind: "customer",
    groupId: "group-customer-1",
    partnerId: PARTNER_1.id,
  },
  regular: {
    username: "",
    kind: "regular",
    groupId: "group-regular-1",
    partnerId: null,
  },
};

// Helper to create a stubbed identity
export const getFakeIdentity = (kind?: IdentityKindEnum): Identity => {
  const identityKind: IdentityKindEnum = kind ?? getUserKindFromStorage();
  return {
    ...FAKE_IDENTITIES[identityKind],
  };
};
