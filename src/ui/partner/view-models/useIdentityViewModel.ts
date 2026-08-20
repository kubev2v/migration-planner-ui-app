import { useInjection } from "@openshift-migration-advisor/ioc";
import type { Identity } from "@openshift-migration-advisor/planner-sdk";
import { useSyncExternalStore } from "react";

import { Symbols } from "../../../config/Dependencies";
import type { IAccountStore } from "../../../data/stores/interfaces/IAccountStore";

export interface IdentityViewModel {
  identity: Identity | null;
}

export const useIdentityViewModel = (): IdentityViewModel => {
  const accountStore = useInjection<IAccountStore>(Symbols.AccountStore);
  const identity = useSyncExternalStore(
    accountStore.subscribe.bind(accountStore),
    accountStore.getSnapshot.bind(accountStore),
  );

  return {
    identity,
  };
};
