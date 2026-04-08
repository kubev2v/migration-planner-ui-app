import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import { type Partner } from "../../models/PartnerModel";
import { getFakePartners } from "../stubs/stubPartners";
import type { IPartnersStore } from "./interfaces/IPartnersStore";

export class PartnersStore
  extends ExternalStoreBase<Partner[]>
  implements IPartnersStore
{
  private partners: Partner[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async list(): Promise<Partner[]> {
    this.partners = getFakePartners();
    console.log("[PartnersStore] GET /api/partners", this.partners);
    this.notify();
    return this.partners;
  }

  override getSnapshot(): Partner[] {
    return this.partners;
  }
}
