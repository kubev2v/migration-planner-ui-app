import type { Group } from "@openshift-migration-advisor/planner-sdk";

import type {
  PartnerRequest,
  PartnerRequestCreate,
} from "../../models/PartnerRequestModel";
import { PARTNER_1, PARTNER_2 } from "./stubGroups";

// Fake partner requests
const _FAKE_PARTNER_REQUESTS: PartnerRequest[] = [
  {
    id: "pr-1",
    status: "rejected",
    statusReason:
      "insufficient capacity and unavailable resources at this time",
    group: PARTNER_1,
    username: "user1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "pr-2",
    status: "pending",
    statusReason: "",
    group: PARTNER_2,
    username: "user1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
// constant used in getFakePartnerRequests when dev wants to test empty partner requests
const _EMPTY_PARTNER_REQUESTS: PartnerRequest[] = [];

export const getFakePartnerRequests = (): PartnerRequest[] => {
  return [..._EMPTY_PARTNER_REQUESTS];
};

export const createFakePartnerRequest = (
  data: PartnerRequestCreate,
  group: Group,
): PartnerRequest => {
  const now = new Date().toISOString();
  return {
    id: `req-${Date.now()}`,
    status: "pending",
    statusReason: "",
    group,
    username: data.username,
    createdAt: now,
    updatedAt: now,
  };
};
