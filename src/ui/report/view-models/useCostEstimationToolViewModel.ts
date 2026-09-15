import { useState } from "react";
import { useAsyncFn } from "react-use";

import type {
  CalculateCostEstimationRequest,
  CostEstimationFormValues,
  CostEstimationResponse,
} from "../../../models/CostEstimationModel";
import { ALL_CLUSTERS_ID, toApiClusterId } from "../helpers/clusterViewModel";
import {
  useAssessmentsStore,
  useMappedAsyncError,
} from "./useRecommendationToolRuntime";

export interface CostEstimationToolViewModel {
  costEstimation: CostEstimationResponse | null;
  isLoadingCostEstimation: boolean;
  costEstimationError: Error | undefined;
  calculateCostEstimation: (
    costEstimationData: CostEstimationFormValues,
  ) => Promise<void>;
}

const formValuesToRequest = (
  assessmentId: string,
  clusterId: string,
  form: CostEstimationFormValues,
): CalculateCostEstimationRequest => {
  const apiClusterId = toApiClusterId(clusterId);
  const isAggregate = clusterId === ALL_CLUSTERS_ID || apiClusterId === "";

  return {
    assessmentId,
    ...(isAggregate
      ? { scope: "assessment" }
      : { clusterId: apiClusterId, scope: "cluster" }),
    vmwareSolution: {
      name: form.vmwareSolution,
      discount: form.vmwareDiscount,
    },
    rhEdition: {
      name: form.rhEdition,
      includeACM: form.includeACM,
      openshiftDiscount: form.openshiftDiscount,
      withAap: form.withAap,
      aapDiscount: form.aapDiscount,
      thirdPartyISVCost: form.thirdPartyISVCost,
      additionalStorageCost: form.additionalStorageCost,
      swingHardwareCost: form.swingHardwareCost,
    },
    consolidationPct: form.consolidationPct,
  };
};

export const useCostEstimationToolViewModel = (
  assessmentId: string,
  clusterId: string,
): CostEstimationToolViewModel => {
  const assessmentsStore = useAssessmentsStore();
  const apiError = useMappedAsyncError();
  const [costEstimation, setCostEstimation] =
    useState<CostEstimationResponse | null>(null);

  const [costEstimationState, doCalculateCostEstimation] = useAsyncFn(
    async (costEstimationData: CostEstimationFormValues) => {
      apiError.clear();
      setCostEstimation(null);
      try {
        const result = await assessmentsStore.calculateCostEstimation(
          formValuesToRequest(assessmentId, clusterId, costEstimationData),
        );
        setCostEstimation(result);
      } catch (err) {
        throw await apiError.capture(
          err,
          "Failed to calculate cost estimation",
        );
      }
    },
    [assessmentId, assessmentsStore, clusterId],
  );

  return {
    costEstimation,
    isLoadingCostEstimation: costEstimationState.loading,
    costEstimationError: apiError.resolve(costEstimationState.error),
    calculateCostEstimation: doCalculateCostEstimation,
  };
};
