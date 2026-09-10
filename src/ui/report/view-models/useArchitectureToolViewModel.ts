import { useState } from "react";
import { useAsyncFn } from "react-use";

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
import type { UseArchitectureToolOptions } from "./RecommendationToolOptions";
import {
  useAssessmentsStore,
  useCapturedOnce,
  useMappedAsyncError,
} from "./useRecommendationToolRuntime";

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
  const assessmentsStore = useAssessmentsStore();
  const apiError = useMappedAsyncError();

  const initialValues = useCapturedOnce(() => ({
    formValues: options?.initialFormValues ?? DEFAULT_FORM_VALUES,
    sizerOutput: options?.initialSizerOutput ?? null,
  }));

  const [formValues, setFormValues] = useState<SizingFormValues>(
    initialValues.formValues,
  );
  const [sizerOutput, setSizerOutput] =
    useState<ClusterRequirementsResponse | null>(initialValues.sizerOutput);

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

    apiError.clear();
    const workerCpu =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].cpu
        : formValues.customCpu;
    const workerMemory =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].memoryGb
        : formValues.customMemoryGb;

    // Cluster-requirements needs a real cluster id. Architecture is disabled
    // for All vSphere clusters, so do not map through toApiClusterId.
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
      throw await apiError.capture(err, "Failed to calculate sizing");
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
    calculateError: apiError.resolve(calculateState.error),
    calculate: doCalculate,
    isFormValid: !hasSmtError,
  };
};
