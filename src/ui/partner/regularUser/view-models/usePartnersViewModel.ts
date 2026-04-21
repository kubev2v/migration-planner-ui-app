import type {
  PartnerRequest,
  PartnerRequestCreate,
} from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync, useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IPartnerRequestsStore } from "../../../../data/stores/interfaces/IPartnerRequestsStore";
import type { IPartnersStore } from "../../../../data/stores/interfaces/IPartnersStore";
import type { Partner } from "../../../../models/PartnerModel";

export interface PartnersViewModel {
  partners: Partner[];
  isLoading: boolean;
  error?: Error;
  createPartnerRequest: (
    partnerId: string,
    data: PartnerRequestCreate,
  ) => Promise<PartnerRequest>;
}

export const usePartnersViewModel = (): PartnersViewModel => {
  const partnersStore = useInjection<IPartnersStore>(Symbols.PartnersStore);
  const partnerRequestsStore = useInjection<IPartnerRequestsStore>(
    Symbols.PartnerRequestsStore,
  );

  const partners = useSyncExternalStore<Partner[]>(
    partnersStore.subscribe.bind(partnersStore),
    partnersStore.getSnapshot.bind(partnersStore),
  );

  const { loading, error } = useAsync(() => partnersStore.list(), []);

  const [createState, doCreatePartnerRequest] = useAsyncFn(
    async (partnerId: string, data: PartnerRequestCreate) => {
      return await partnerRequestsStore.create(partnerId, data);
    },
    [partnerRequestsStore],
  );

  return {
    partners,
    isLoading: loading || createState.loading,
    error: error || createState.error,
    createPartnerRequest: doCreatePartnerRequest,
  };
};
