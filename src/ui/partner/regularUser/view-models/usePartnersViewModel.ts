import { useInjection } from "@y0n1/react-ioc";
import { useCallback, useSyncExternalStore } from "react";
import { useAsync } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IIdentityStore } from "../../../../data/stores/interfaces/IIdentityStore";
import type { IPartnerRequestsStore } from "../../../../data/stores/interfaces/IPartnerRequestsStore";
import type { IPartnersStore } from "../../../../data/stores/interfaces/IPartnersStore";
import type { Partner } from "../../../../models/PartnerModel";
import type { PartnerRequestValues } from "../../../../models/PartnerRequestModel";

export interface PartnersViewModel {
  partners: Partner[];
  isLoading: boolean;
  error?: Error;
  createPartnerRequest: (values: PartnerRequestValues) => Promise<void>;
}

export const usePartnersViewModel = (): PartnersViewModel => {
  const partnersStore = useInjection<IPartnersStore>(Symbols.PartnersStore);
  const partnerRequestsStore = useInjection<IPartnerRequestsStore>(
    Symbols.PartnerRequestsStore,
  );
  const identityStore = useInjection<IIdentityStore>(Symbols.IdentityStore);

  const partners = useSyncExternalStore<Partner[]>(
    partnersStore.subscribe.bind(partnersStore),
    partnersStore.getSnapshot.bind(partnersStore),
  );

  // Load partners on mount
  const { loading, error } = useAsync(() => partnersStore.list(), []);

  const createPartnerRequest = useCallback(
    async (request: PartnerRequestValues) => {
      const identity = identityStore.getSnapshot();
      if (!identity) {
        throw new Error("No identity found");
      }
      await partnerRequestsStore.create({
        username: identity.username,
        request,
      });
    },
    [partnerRequestsStore, identityStore],
  );

  return {
    partners,
    isLoading: loading,
    error,
    createPartnerRequest,
  };
};
