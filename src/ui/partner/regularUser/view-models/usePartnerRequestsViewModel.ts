import type { PartnerRequest } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync, useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IPartnerRequestsStore } from "../../../../data/stores/interfaces/IPartnerRequestsStore";

export interface PartnerRequestsViewModel {
  requests: PartnerRequest[];
  hasPendingRequest: boolean;
  isLoading: boolean;
  error?: Error;
  cancelPartnerRequest: (partnerRequestId: string) => Promise<void>;
}

export const usePartnerRequestsViewModel = (): PartnerRequestsViewModel => {
  const partnerRequestsStore = useInjection<IPartnerRequestsStore>(
    Symbols.PartnerRequestsStore,
  );
  const requests = useSyncExternalStore<PartnerRequest[]>(
    partnerRequestsStore.subscribe.bind(partnerRequestsStore),
    partnerRequestsStore.getSnapshot.bind(partnerRequestsStore),
  );

  const { loading, error } = useAsync(() => partnerRequestsStore.list(), []);

  const [cancelState, doCancelPartnerRequest] = useAsyncFn(
    async (partnerRequestId: string): Promise<void> => {
      return await partnerRequestsStore.cancel(partnerRequestId);
    },
    [partnerRequestsStore],
  );

  return {
    requests,
    hasPendingRequest: requests.some(
      (request) => request.requestStatus === "pending",
    ),
    isLoading: loading || cancelState.loading,
    error: error || cancelState.error,
    cancelPartnerRequest: doCancelPartnerRequest,
  };
};
