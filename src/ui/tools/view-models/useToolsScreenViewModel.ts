import { useNavigate } from "react-router-dom";

import { useIsPartner } from "../../../hooks/useIdentity";
import { routes } from "../../../routing/Routes";

export interface ToolsScreenViewModel {
  isPartner: boolean;
  navigateToClusterSizing: () => void;
  navigateToCostEstimation: () => void;
}

export const useToolsScreenViewModel = (): ToolsScreenViewModel => {
  const navigate = useNavigate();

  const isPartner = useIsPartner();

  return {
    isPartner,
    navigateToClusterSizing: () => void navigate(routes.clusterSizing),
    navigateToCostEstimation: () => void navigate(routes.costEstimation),
  };
};
