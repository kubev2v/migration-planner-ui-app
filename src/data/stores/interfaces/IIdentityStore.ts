import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";
import type { Identity } from "../../../models/IdentityModel";

export interface IIdentityStore extends ExternalStore<Identity | null> {
  getIdentity(): Promise<Identity>;
}
