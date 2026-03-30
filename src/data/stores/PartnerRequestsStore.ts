import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import {
  type PartnerRequest,
  type PartnerRequestCreate,
} from "../../models/PartnerRequestModel";
import { getFakeOrganizations } from "../stubs/stubOrganizations";
import {
  createFakePartnerRequest,
  getFakePartnerRequests,
} from "../stubs/stubPartnerRequests";
import type { IPartnerRequestsStore } from "./interfaces/IPartnerRequestsStore";

export class PartnerRequestsStore
  extends ExternalStoreBase<PartnerRequest[]>
  implements IPartnerRequestsStore
{
  private partnerRequests: PartnerRequest[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async list(): Promise<PartnerRequest[]> {
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    this.partnerRequests = getFakePartnerRequests();
    console.log(
      "[PartnerRequestsStore] GET /api/partners/requests",
      this.partnerRequests,
    );
    this.notify();
    return this.partnerRequests;
  }

  async create(data: PartnerRequestCreate): Promise<PartnerRequest> {
    if (process.env.NODE_ENV === "production") {
      return Promise.reject(
        new Error("POST /api/partners/requests not implemented"),
      );
    }
    console.log("[PartnerRequestsStore] POST /api/partners/requests", data);
    const organization = getFakeOrganizations().find(
      (organization) => organization.id === data.request.partnerId,
    );
    if (!organization) {
      throw new Error(`Organization ${data.request.partnerId} not found`);
    }
    const newRequest = createFakePartnerRequest(data, organization);
    this.partnerRequests = [...this.partnerRequests, newRequest];
    this.notify();
    return newRequest;
  }

  async delete(request: PartnerRequest): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      return Promise.reject(
        new Error(
          `DELETE /api/partners/requests/${request.id} not implemented`,
        ),
      );
    }

    this.partnerRequests = this.partnerRequests.filter(
      (r) => r.id !== request.id,
    );
    console.log(
      `[PartnerRequestsStore] DELETE /api/partners/requests/${request.id}`,
    );
    this.notify();
  }

  override getSnapshot(): PartnerRequest[] {
    return this.partnerRequests;
  }
}
