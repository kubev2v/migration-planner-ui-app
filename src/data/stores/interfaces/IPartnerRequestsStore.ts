import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";
import type {
  PartnerRequest,
  PartnerRequestCreate,
} from "../../../models/PartnerRequestModel";

export interface IPartnerRequestsStore extends ExternalStore<PartnerRequest[]> {
  list(): Promise<PartnerRequest[]>;
  create(data: PartnerRequestCreate): Promise<PartnerRequest>;
  delete(request: PartnerRequest): Promise<void>;
}
