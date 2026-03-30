import { useInjection } from "@y0n1/react-ioc";
import { useEffect, useSyncExternalStore } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IIdentityStore } from "../../../../data/stores/interfaces/IIdentityStore";
import type { IOrganizationsStore } from "../../../../data/stores/interfaces/IOrganizationsStore";
import type { Organization } from "../../../../models/OrganizationModel";

export interface MyPartnerViewModel {
  partnerOrganization?: Organization;
  isLoading: boolean;
  error?: Error;
}

export const useMyPartnerViewModel = (): MyPartnerViewModel => {
  const identityStore = useInjection<IIdentityStore>(Symbols.IdentityStore);
  const identity = useSyncExternalStore(
    identityStore.subscribe.bind(identityStore),
    identityStore.getSnapshot.bind(identityStore),
  );

  const organizationsStore = useInjection<IOrganizationsStore>(
    Symbols.OrganizationsStore,
  );

  useSyncExternalStore<Organization[]>(
    organizationsStore.subscribe.bind(organizationsStore),
    organizationsStore.getSnapshot.bind(organizationsStore),
  );

  // Fetch organization by identity's partnerId
  const [fetchState, doFetchOrganization] = useAsyncFn(
    async (partnerId: string) => {
      const organization = await organizationsStore.get(partnerId);
      return organization;
    },
    [organizationsStore],
  );

  // Load partner organization when identity is available
  useEffect(() => {
    if (identity?.partnerId) {
      void doFetchOrganization(identity.partnerId);
    }
  }, [identity?.partnerId, doFetchOrganization]);

  return {
    partnerOrganization: fetchState.value,
    isLoading: fetchState.loading,
    error: fetchState.error,
  };
};
