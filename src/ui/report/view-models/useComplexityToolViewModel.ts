import { useInjection } from "@openshift-migration-advisor/ioc";
import type {
  MigrationComplexityResponse,
  MigrationEstimationByComplexityResponse,
} from "@openshift-migration-advisor/planner-sdk";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { toApiClusterId } from "../helpers/clusterViewModel";
import { mapAssessmentApiError } from "./mapAssessmentApiError";
import type { UseComplexityToolOptions } from "./RecommendationToolOptions";

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
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const initialValues = useMemo(
    () => ({
      complexityEstimation: options?.initialComplexityEstimation ?? null,
      estimationByComplexity: options?.initialEstimationByComplexity ?? null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [complexityEstimation, setComplexityEstimation] =
    useState<MigrationComplexityResponse | null>(
      initialValues.complexityEstimation,
    );
  const [estimationByComplexity, setEstimationByComplexity] =
    useState<MigrationEstimationByComplexityResponse | null>(
      initialValues.estimationByComplexity,
    );
  const [manualComplexityError, setManualComplexityError] = useState<
    Error | undefined
  >(undefined);
  const [manualEstByComplexityError, setManualEstByComplexityError] = useState<
    Error | undefined
  >(undefined);
  const latestComplexityRequestIdRef = useRef<string>("");

  const [complexityState, doCalculateComplexity] = useAsyncFn(async () => {
    setManualComplexityError(undefined);
    const requestId = `${assessmentId}-${clusterId}-${Date.now()}`;
    latestComplexityRequestIdRef.current = requestId;

    try {
      const result = await assessmentsStore.calculateComplexityEstimation({
        id: assessmentId,
        migrationComplexityRequest: { clusterId: toApiClusterId(clusterId) },
      });

      if (latestComplexityRequestIdRef.current === requestId) {
        setComplexityEstimation(result);
      }
    } catch (err) {
      if (latestComplexityRequestIdRef.current !== requestId) {
        return;
      }

      const error = await mapAssessmentApiError(
        err,
        "Failed to calculate complexity estimation",
      );
      setManualComplexityError(error);
      throw error;
    }
  }, [assessmentId, assessmentsStore, clusterId]);

  const [estByComplexityState, doCalculateEstimationByComplexity] =
    useAsyncFn(async () => {
      setManualEstByComplexityError(undefined);
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
        setEstimationByComplexity(result);
      } catch (err) {
        const error = await mapAssessmentApiError(
          err,
          "Failed to calculate estimation by complexity",
        );
        setManualEstByComplexityError(error);
        throw error;
      }
    }, [assessmentId, assessmentsStore, clusterId]);

  useEffect(() => {
    if (!options?.autoLoad || initialValues.complexityEstimation) {
      return;
    }
    void doCalculateComplexity();
    void doCalculateEstimationByComplexity();
  }, [
    options?.autoLoad,
    initialValues.complexityEstimation,
    doCalculateComplexity,
    doCalculateEstimationByComplexity,
  ]);

  return {
    complexityEstimation,
    isCalculatingComplexity:
      complexityState.loading ||
      (Boolean(options?.autoLoad) &&
        complexityEstimation === null &&
        (manualComplexityError ?? complexityState.error) === undefined),
    complexityError: manualComplexityError ?? complexityState.error,
    estimationByComplexity,
    isCalculatingEstimationByComplexity: estByComplexityState.loading,
    estimationByComplexityError:
      manualEstByComplexityError ?? estByComplexityState.error,
  };
};
