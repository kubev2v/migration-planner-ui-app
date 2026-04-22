import type {
  PartnerRequest,
  PartnerRequestCreate,
} from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IPartnerRequestsStore extends ExternalStore<PartnerRequest[]> {
  list(): Promise<PartnerRequest[]>;
  create(groupId: string, data: PartnerRequestCreate): Promise<PartnerRequest>;
  accept(partnerRequestId: string): Promise<PartnerRequest>;
  cancel(partnerRequestId: string): Promise<void>;
  reject(partnerRequestId: string, reason: string): Promise<PartnerRequest>;
}
