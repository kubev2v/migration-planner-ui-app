import type { Identity } from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

/**
 * The SDK {@link Identity} DTO enriched with derived boolean shortcuts.
 * Shortcuts are computed once when the identity is fetched, so the snapshot
 * stays referentially stable for `useSyncExternalStore`.
 */
export type IdentityView = Identity & {
  readonly isPartner: boolean;
};

export interface IAccountStore extends ExternalStore<IdentityView | null> {
  getIdentity(): Promise<IdentityView>;
}
