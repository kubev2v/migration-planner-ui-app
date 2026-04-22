import type { PartnerRequest } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync, useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IPartnerRequestsStore } from "../../../../data/stores/interfaces/IPartnerRequestsStore";

export interface CustomerRequestsViewModel {
  requests: PartnerRequest[];
  isLoading: boolean;
  error?: Error;
  acceptPartnerRequest: (partnerRequestId: string) => Promise<PartnerRequest>;
  rejectPartnerRequest: (
    partnerRequestId: string,
    reason: string,
  ) => Promise<PartnerRequest>;
}

export const useCustomerRequestsViewModel = (): CustomerRequestsViewModel => {
  const partnerRequestsStore = useInjection<IPartnerRequestsStore>(
    Symbols.PartnerRequestsStore,
  );

  const requests = useSyncExternalStore<PartnerRequest[]>(
    partnerRequestsStore.subscribe.bind(partnerRequestsStore),
    partnerRequestsStore.getSnapshot.bind(partnerRequestsStore),
  );

  const { loading, error } = useAsync(() => partnerRequestsStore.list(), []);

  const [acceptState, doAcceptPartnerRequest] = useAsyncFn(
    async (partnerRequestId: string): Promise<PartnerRequest> => {
      return await partnerRequestsStore.accept(partnerRequestId);
    },
    [partnerRequestsStore],
  );

  const [rejectState, doRejectPartnerRequest] = useAsyncFn(
    async (
      partnerRequestId: string,
      reason: string,
    ): Promise<PartnerRequest> => {
      return await partnerRequestsStore.reject(partnerRequestId, reason);
    },
    [partnerRequestsStore],
  );

  return {
    requests,
    isLoading: loading || acceptState.loading || rejectState.loading,
    error: error || acceptState.error || rejectState.error,
    acceptPartnerRequest: doAcceptPartnerRequest,
    rejectPartnerRequest: doRejectPartnerRequest,
  };
};
