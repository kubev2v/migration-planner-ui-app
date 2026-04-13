import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IPartnerRequestsStore } from "../../../../data/stores/interfaces/IPartnerRequestsStore";
import type { PartnerRequest } from "../../../../models/PartnerRequestModel";

export interface PartnerRequestsViewModel {
  requests: PartnerRequest[];
  hasPendingRequest: boolean;
  isLoading: boolean;
  error?: Error;
  cancelRequest: (request: PartnerRequest) => Promise<void>;
}

export const usePartnerRequestsViewModel = (): PartnerRequestsViewModel => {
  const partnerRequestsStore = useInjection<IPartnerRequestsStore>(
    Symbols.PartnerRequestsStore,
  );
  const requests = useSyncExternalStore<PartnerRequest[]>(
    partnerRequestsStore.subscribe.bind(partnerRequestsStore),
    partnerRequestsStore.getSnapshot.bind(partnerRequestsStore),
  );

  // Load organizations on mount
  const { loading, error } = useAsync(() => partnerRequestsStore.list(), []);

  const cancelRequest = async (request: PartnerRequest) => {
    await partnerRequestsStore.delete(request);
  };

  return {
    requests,
    hasPendingRequest: requests.some((request) => request.status === "pending"),
    isLoading: loading,
    error,
    cancelRequest,
  };
};
