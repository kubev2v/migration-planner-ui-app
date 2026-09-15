import { useInjection } from "@openshift-migration-advisor/ioc";
import { useSyncExternalStore } from "react";

import { Symbols } from "../config/Dependencies";
import type {
  IAccountStore,
  IdentityView,
} from "../data/stores/interfaces/IAccountStore";

/**
 * Subscribes to the current account identity from the {@link IAccountStore}.
 * Returns the identity enriched with derived shortcuts (e.g. `isPartner`), or
 * `null` until the identity has been resolved.
 */
export const useIdentity = (): IdentityView | null => {
  const accountStore = useInjection<IAccountStore>(Symbols.AccountStore);
  return useSyncExternalStore(
    accountStore.subscribe.bind(accountStore),
    accountStore.getSnapshot.bind(accountStore),
  );
};

/**
 * Whether the current account is a partner. Thin alias over the enriched
 * identity for callers that only need the boolean and treat an unresolved
 * identity as "not a partner".
 */
export const useIsPartner = (): boolean => useIdentity()?.isPartner ?? false;
