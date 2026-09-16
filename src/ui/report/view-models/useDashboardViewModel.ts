import type {
  Infra,
  InventoryData,
} from "@openshift-migration-advisor/planner-sdk";
import {
  buildClusterDetailRows,
  buildClusterDetails,
  buildInfrastructureSummary,
  type ClusterDetailRow,
  type ClusterDetailsModel,
  type InfrastructureSummaryModel,
} from "@openshift-migration-advisor/shared-components";
import { useMemo } from "react";

export interface UseDashboardViewModelParams {
  infra: Infra;
  vcenterVersion?: string;
  vcenterId?: string;
  clusters?: { [key: string]: InventoryData };
  isAggregateView: boolean;
}

export interface DashboardViewModel {
  infrastructureSummary: InfrastructureSummaryModel;
  clusterDetailRows: ClusterDetailRow[];
  selectedClusterDetails: ClusterDetailsModel | undefined;
}

export const useDashboardViewModel = ({
  infra,
  vcenterVersion,
  vcenterId,
  clusters,
  isAggregateView,
}: UseDashboardViewModelParams): DashboardViewModel => {
  const infrastructureSummary = useMemo(
    () =>
      buildInfrastructureSummary({
        infra,
        vcenterVersion,
        vcenterId,
        clusters,
      }),
    [infra, vcenterVersion, vcenterId, clusters],
  );

  const clusterDetailRows = useMemo(
    () => buildClusterDetailRows(clusters),
    [clusters],
  );

  const selectedClusterDetails = useMemo(() => {
    if (isAggregateView || !clusters) {
      return undefined;
    }
    const selectedClusterId = Object.keys(clusters)[0];
    return selectedClusterId
      ? buildClusterDetails(clusters[selectedClusterId])
      : undefined;
  }, [isAggregateView, clusters]);

  return {
    infrastructureSummary,
    clusterDetailRows,
    selectedClusterDetails,
  };
};
