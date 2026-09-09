import { useInjection } from "@openshift-migration-advisor/ioc";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { toApiClusterId } from "../helpers/clusterViewModel";
import { DEFAULT_ESTIMATION_FORM_VALUES } from "../views/cluster-sizer/constants";
import type {
  EstimationFormValues,
  MigrationEstimationResponse,
} from "../views/cluster-sizer/types";
import { estimationFormToParams } from "../views/cluster-sizer/types";
import { mapAssessmentApiError } from "./mapAssessmentApiError";
import type { UseTimeEstimationToolOptions } from "./RecommendationToolOptions";

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
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const initialMigrationEstimation = useMemo(
    () => options?.initialMigrationEstimation ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [estimationFormValues, setEstimationFormValues] =
    useState<EstimationFormValues>(DEFAULT_ESTIMATION_FORM_VALUES);
  const [migrationEstimation, setMigrationEstimation] =
    useState<MigrationEstimationResponse | null>(initialMigrationEstimation);
  const [manualEstimationError, setManualEstimationError] = useState<
    Error | undefined
  >(undefined);

  const [estimationState, doCalculateEstimation] = useAsyncFn(async () => {
    setManualEstimationError(undefined);
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
      const error = await mapAssessmentApiError(
        err,
        "Failed to calculate migration estimation",
      );
      setManualEstimationError(error);
      throw error;
    }
  }, [assessmentId, assessmentsStore, clusterId, estimationFormValues]);

  return {
    estimationFormValues,
    setEstimationFormValues,
    migrationEstimation,
    isCalculatingEstimation: estimationState.loading,
    estimationError: manualEstimationError ?? estimationState.error,
    calculateEstimation: doCalculateEstimation,
  };
};
