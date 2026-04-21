import type { PartnerApiInterface } from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { Partner } from "../../models/PartnerModel";
import type { IPartnersStore } from "./interfaces/IPartnersStore";

export class PartnersStore
  extends ExternalStoreBase<Partner[]>
  implements IPartnersStore
{
  private partners: Partner[] = [];
  private api: PartnerApiInterface;

  constructor(api: PartnerApiInterface) {
    super();
    this.api = api;
  }

  async list(): Promise<Partner[]> {
    const groups = await this.api.listPartners({});
    this.partners = groups.filter((g) => g.kind === "partner") as Partner[];
    this.notify();
    return this.partners;
  }

  override getSnapshot(): Partner[] {
    return this.partners;
  }
}
