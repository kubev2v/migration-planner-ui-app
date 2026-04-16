import type { Identity } from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IAccountStore extends ExternalStore<Identity | null> {
  getIdentity(): Promise<Identity>;
}
