import { useState } from "react";
import { useAsyncFn } from "react-use";

import { toApiClusterId } from "../helpers/clusterViewModel";
import { DEFAULT_ESTIMATION_FORM_VALUES } from "../views/cluster-sizer/constants";
import type {
  EstimationFormValues,
  MigrationEstimationResponse,
} from "../views/cluster-sizer/types";
import { estimationFormToParams } from "../views/cluster-sizer/types";
import type { UseTimeEstimationToolOptions } from "./RecommendationToolOptions";
import {
  useAssessmentsStore,
  useCapturedOnce,
  useMappedAsyncError,
} from "./useRecommendationToolRuntime";

export interface TimeEstimationToolViewModel {
  estimationFormValues: EstimationFormValues;
  setEstimationFormValues: (v: EstimationFormValues) => void;
  migrationEstimation: MigrationEstimationResponse | null;
  isCalculatingEstimation: boolean;
  estimationError: Error | undefined;
  calculateEstimation: () => Promise<void>;
}

export const useTimeEstimationToolViewModel = (
  assessmentId: string,
  clusterId: string,
  options?: UseTimeEstimationToolOptions,
): TimeEstimationToolViewModel => {
  const assessmentsStore = useAssessmentsStore();
  const apiError = useMappedAsyncError();

  const initialMigrationEstimation = useCapturedOnce(
    () => options?.initialMigrationEstimation ?? null,
  );

  const [estimationFormValues, setEstimationFormValues] =
    useState<EstimationFormValues>(DEFAULT_ESTIMATION_FORM_VALUES);
  const [migrationEstimation, setMigrationEstimation] =
    useState<MigrationEstimationResponse | null>(initialMigrationEstimation);

  const [estimationState, doCalculateEstimation] = useAsyncFn(async () => {
    apiError.clear();
    try {
      const result = await assessmentsStore.calculateMigrationEstimation({
        id: assessmentId,
        migrationEstimationRequest: {
          clusterId: toApiClusterId(clusterId),
          estimationSchema: ["network-based", "storage-offload"],
          params: estimationFormToParams(estimationFormValues),
        },
      });

      const hasSchemas =
        result?.estimation && Object.keys(result.estimation).length > 0;
      setMigrationEstimation(hasSchemas ? result : null);
    } catch (err) {
      throw await apiError.capture(
        err,
        "Failed to calculate migration estimation",
      );
    }
  }, [assessmentId, assessmentsStore, clusterId, estimationFormValues]);

  return {
    estimationFormValues,
    setEstimationFormValues,
    migrationEstimation,
    isCalculatingEstimation: estimationState.loading,
    estimationError: apiError.resolve(estimationState.error),
    calculateEstimation: doCalculateEstimation,
  };
};
