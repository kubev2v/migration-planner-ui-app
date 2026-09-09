import { useInjection } from "@openshift-migration-advisor/ioc";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import {
  DEFAULT_FORM_VALUES,
  SMT_THREADS_MAX,
  SMT_THREADS_MIN,
  WORKER_NODE_PRESETS,
} from "../views/cluster-sizer/constants";
import type {
  ClusterRequirementsResponse,
  SizingFormValues,
} from "../views/cluster-sizer/types";
import { formValuesToRequest } from "../views/cluster-sizer/types";
import { mapAssessmentApiError } from "./mapAssessmentApiError";
import type { UseArchitectureToolOptions } from "./RecommendationToolOptions";

export interface ArchitectureToolViewModel {
  formValues: SizingFormValues;
  setFormValues: (v: SizingFormValues) => void;
  showWorkerNode: boolean;
  showControlPlane: boolean;
  showControlPlaneScheduling: boolean;
  showSmt: boolean;
  sizerOutput: ClusterRequirementsResponse | null;
  isCalculating: boolean;
  calculateError: Error | undefined;
  calculate: () => Promise<void>;
  isFormValid: boolean;
}

export const useArchitectureToolViewModel = (
  assessmentId: string,
  clusterId: string,
  options?: UseArchitectureToolOptions,
): ArchitectureToolViewModel => {
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const initialValues = useMemo(
    () => ({
      formValues: options?.initialFormValues ?? DEFAULT_FORM_VALUES,
      sizerOutput: options?.initialSizerOutput ?? null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [formValues, setFormValues] = useState<SizingFormValues>(
    initialValues.formValues,
  );
  const [sizerOutput, setSizerOutput] =
    useState<ClusterRequirementsResponse | null>(initialValues.sizerOutput);
  const [manualCalculateError, setManualCalculateError] = useState<
    Error | undefined
  >(undefined);

  const smtVisible =
    formValues.clusterMode === "full-ha" ||
    formValues.clusterMode === "hosted-control-plane";

  const hasSmtError =
    smtVisible &&
    formValues.smtEnabled &&
    (formValues.smtThreads < SMT_THREADS_MIN ||
      formValues.smtThreads > SMT_THREADS_MAX);

  const [calculateState, doCalculate] = useAsyncFn(async () => {
    if (hasSmtError) {
      return;
    }

    setManualCalculateError(undefined);
    const workerCpu =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].cpu
        : formValues.customCpu;
    const workerMemory =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].memoryGb
        : formValues.customMemoryGb;

    const clusterRequirementsRequest = formValuesToRequest(
      clusterId,
      formValues,
      workerCpu,
      workerMemory,
    );

    try {
      const result =
        await assessmentsStore.calculateAssessmentClusterRequirements({
          id: assessmentId,
          clusterRequirementsRequest,
        });
      setSizerOutput(result);
    } catch (err) {
      const error = await mapAssessmentApiError(
        err,
        "Failed to calculate sizing",
      );
      setManualCalculateError(error);
      throw error;
    }
  }, [assessmentId, assessmentsStore, clusterId, formValues, hasSmtError]);

  return {
    formValues,
    setFormValues,
    showWorkerNode:
      formValues.clusterMode === "full-ha" ||
      formValues.clusterMode === "hosted-control-plane",
    showControlPlane:
      formValues.clusterMode === "full-ha" ||
      formValues.clusterMode === "single-node" ||
      formValues.clusterMode === "compact",
    showControlPlaneScheduling: formValues.clusterMode === "full-ha",
    showSmt: smtVisible,
    sizerOutput,
    isCalculating: calculateState.loading,
    calculateError: manualCalculateError ?? calculateState.error,
    calculate: doCalculate,
    isFormValid: !hasSmtError,
  };
};
