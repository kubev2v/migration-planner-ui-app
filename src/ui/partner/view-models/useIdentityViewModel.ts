import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";

import { Symbols } from "../../../config/Dependencies";
import type { IIdentityStore } from "../../../data/stores/interfaces/IIdentityStore";
import type { Identity } from "../../../models/IdentityModel";

export interface IdentityViewModel {
  identity: Identity | null;
}

export const useIdentityViewModel = (): IdentityViewModel => {
  const identityStore = useInjection<IIdentityStore>(Symbols.IdentityStore);
  const identity = useSyncExternalStore(
    identityStore.subscribe.bind(identityStore),
    identityStore.getSnapshot.bind(identityStore),
  );

  return {
    identity,
  };
};
