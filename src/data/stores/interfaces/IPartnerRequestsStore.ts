import type {
  PartnerRequest,
  PartnerRequestCreate,
} from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IPartnerRequestsStore extends ExternalStore<PartnerRequest[]> {
  list(): Promise<PartnerRequest[]>;
  create(groupId: string, data: PartnerRequestCreate): Promise<PartnerRequest>;
  cancel(partnerRequestId: string): Promise<void>;
}
