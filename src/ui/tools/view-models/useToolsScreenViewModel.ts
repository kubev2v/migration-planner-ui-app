import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";

import { Symbols } from "../../../config/Dependencies";
import type { IAccountStore } from "../../../data/stores/interfaces/IAccountStore";
import { routes } from "../../../routing/Routes";

export interface ToolsScreenViewModel {
  isPartner: boolean;
  navigateToClusterSizing: () => void;
  navigateToCostEstimation: () => void;
}

export const useToolsScreenViewModel = (): ToolsScreenViewModel => {
  const navigate = useNavigate();

  const accountStore = useInjection<IAccountStore>(Symbols.AccountStore);
  const identity = useSyncExternalStore(
    accountStore.subscribe.bind(accountStore),
    accountStore.getSnapshot.bind(accountStore),
  );

  const isPartner = identity?.kind === "partner";

  return {
    isPartner,
    navigateToClusterSizing: () => void navigate(routes.clusterSizing),
    navigateToCostEstimation: () => void navigate(routes.costEstimation),
  };
};
