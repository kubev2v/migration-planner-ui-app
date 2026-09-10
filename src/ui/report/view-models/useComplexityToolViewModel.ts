import type {
  MigrationComplexityResponse,
  MigrationEstimationByComplexityResponse,
} from "@openshift-migration-advisor/planner-sdk";
import { useEffect, useState } from "react";
import { useAsyncFn } from "react-use";

import { toApiClusterId } from "../helpers/clusterViewModel";
import type { UseComplexityToolOptions } from "./RecommendationToolOptions";
import {
  useAssessmentsStore,
  useCapturedOnce,
  useLatestRequest,
  useMappedAsyncError,
} from "./useRecommendationToolRuntime";

export interface ComplexityToolViewModel {
  complexityEstimation: MigrationComplexityResponse | null;
  isCalculatingComplexity: boolean;
  complexityError: Error | undefined;
  estimationByComplexity: MigrationEstimationByComplexityResponse | null;
  isCalculatingEstimationByComplexity: boolean;
  estimationByComplexityError: Error | undefined;
}

export const useComplexityToolViewModel = (
  assessmentId: string,
  clusterId: string,
  options?: UseComplexityToolOptions,
): ComplexityToolViewModel => {
  const assessmentsStore = useAssessmentsStore();
  const complexityErrorState = useMappedAsyncError();
  const estimationErrorState = useMappedAsyncError();
  const complexityRequest = useLatestRequest();
  const estimationRequest = useLatestRequest();

  const initialValues = useCapturedOnce(() => ({
    complexityEstimation: options?.initialComplexityEstimation ?? null,
    estimationByComplexity: options?.initialEstimationByComplexity ?? null,
  }));

  const [complexityEstimation, setComplexityEstimation] =
    useState<MigrationComplexityResponse | null>(
      initialValues.complexityEstimation,
    );
  const [estimationByComplexity, setEstimationByComplexity] =
    useState<MigrationEstimationByComplexityResponse | null>(
      initialValues.estimationByComplexity,
    );

  const [complexityState, doCalculateComplexity] = useAsyncFn(async () => {
    complexityErrorState.clear();
    const requestId = complexityRequest.begin(`${assessmentId}-${clusterId}`);

    try {
      const result = await assessmentsStore.calculateComplexityEstimation({
        id: assessmentId,
        migrationComplexityRequest: { clusterId: toApiClusterId(clusterId) },
      });

      if (complexityRequest.isCurrent(requestId)) {
        setComplexityEstimation(result);
      }
    } catch (err) {
      if (!complexityRequest.isCurrent(requestId)) {
        return;
      }

      throw await complexityErrorState.capture(
        err,
        "Failed to calculate complexity estimation",
      );
    }
  }, [assessmentId, assessmentsStore, clusterId]);

  const [estByComplexityState, doCalculateEstimationByComplexity] =
    useAsyncFn(async () => {
      estimationErrorState.clear();
      const requestId = estimationRequest.begin(`${assessmentId}-${clusterId}`);

      try {
        const result = await assessmentsStore.calculateEstimationByComplexity({
          id: assessmentId,
          migrationEstimationRequest: {
            clusterId: toApiClusterId(clusterId),
            estimationSchema: ["network-based", "storage-offload"],
            params: {
              work_hours_per_day: 8,
              post_migration_engineers: 10,
              transfer_rate_mbps: 620,
            },
          },
        });
        if (estimationRequest.isCurrent(requestId)) {
          setEstimationByComplexity(result);
        }
      } catch (err) {
        if (!estimationRequest.isCurrent(requestId)) {
          return;
        }

        throw await estimationErrorState.capture(
          err,
          "Failed to calculate estimation by complexity",
        );
      }
    }, [assessmentId, assessmentsStore, clusterId]);

  useEffect(() => {
    if (!options?.autoLoad) {
      return;
    }
    if (!initialValues.complexityEstimation) {
      void doCalculateComplexity();
    }
    if (!initialValues.estimationByComplexity) {
      void doCalculateEstimationByComplexity();
    }
  }, [
    options?.autoLoad,
    initialValues.complexityEstimation,
    initialValues.estimationByComplexity,
    doCalculateComplexity,
    doCalculateEstimationByComplexity,
  ]);

  return {
    complexityEstimation,
    isCalculatingComplexity:
      complexityState.loading ||
      (Boolean(options?.autoLoad) &&
        complexityEstimation === null &&
        complexityErrorState.resolve(complexityState.error) === undefined),
    complexityError: complexityErrorState.resolve(complexityState.error),
    estimationByComplexity,
    isCalculatingEstimationByComplexity:
      estByComplexityState.loading ||
      (Boolean(options?.autoLoad) &&
        estimationByComplexity === null &&
        estimationErrorState.resolve(estByComplexityState.error) === undefined),
    estimationByComplexityError: estimationErrorState.resolve(
      estByComplexityState.error,
    ),
  };
};
