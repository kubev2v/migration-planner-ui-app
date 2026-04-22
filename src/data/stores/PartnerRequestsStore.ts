import type {
  PartnerApiInterface,
  PartnerRequest,
  PartnerRequestCreate,
  PartnerRequestUpdate,
} from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { IPartnerRequestsStore } from "./interfaces/IPartnerRequestsStore";

export class PartnerRequestsStore
  extends ExternalStoreBase<PartnerRequest[]>
  implements IPartnerRequestsStore
{
  private partnerRequests: PartnerRequest[] = [];
  private api: PartnerApiInterface;

  constructor(api: PartnerApiInterface) {
    super();
    this.api = api;
  }

  async list(): Promise<PartnerRequest[]> {
    this.partnerRequests = await this.api.listPartnerRequests({});
    this.notify();
    return this.partnerRequests;
  }

  async create(
    groupId: string,
    data: PartnerRequestCreate,
  ): Promise<PartnerRequest> {
    const newPartnerRequest = await this.api.createPartnerRequest({
      id: groupId,
      partnerRequestCreate: data,
    });
    this.partnerRequests = [...this.partnerRequests, newPartnerRequest];
    this.notify();
    return newPartnerRequest;
  }

  async cancel(partnerRequestId: string): Promise<void> {
    await this.api.cancelPartnerRequest({ id: partnerRequestId });
    await this.list();
  }

  async accept(partnerRequestId: string): Promise<PartnerRequest> {
    const updateData: PartnerRequestUpdate = {
      status: "accepted",
    };
    const updatedRequest = await this.api.updatePartnerRequest({
      id: partnerRequestId,
      partnerRequestUpdate: updateData,
    });
    this.partnerRequests = this.partnerRequests.map((req) =>
      req.id === partnerRequestId ? updatedRequest : req,
    );
    this.notify();
    return updatedRequest;
  }

  async deny(
    partnerRequestId: string,
    reason: string,
  ): Promise<PartnerRequest> {
    const updateData: PartnerRequestUpdate = {
      status: "rejected",
      reason,
    };
    const updatedRequest = await this.api.updatePartnerRequest({
      id: partnerRequestId,
      partnerRequestUpdate: updateData,
    });
    this.partnerRequests = this.partnerRequests.map((req) =>
      req.id === partnerRequestId ? updatedRequest : req,
    );
    this.notify();
    return updatedRequest;
  }

  override getSnapshot(): PartnerRequest[] {
    return this.partnerRequests;
  }
}
