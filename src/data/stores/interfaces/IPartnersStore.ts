import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";
import type { Partner } from "../../../models/PartnerModel";

export interface IPartnersStore extends ExternalStore<Partner[]> {
  list(): Promise<Partner[]>;
}
