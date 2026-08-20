import { useInjection } from "@openshift-migration-advisor/ioc";
import { ResponseError } from "@openshift-migration-advisor/planner-sdk";
import { useCallback, useState } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { ISizingStore } from "../../../../data/stores/interfaces/ISizingStore";
import {
  DEFAULT_FORM_VALUES,
  DEFAULT_WORKLOAD_FORM_VALUES,
  SMT_THREADS_MAX,
  SMT_THREADS_MIN,
  WORKER_NODE_PRESETS,
} from "../../../report/views/cluster-sizer/constants";
import type {
  ClusterRequirementsResponse,
  SizingFormValues,
  WorkloadFormValues,
} from "../../../report/views/cluster-sizer/types";
import {
  standaloneResponseToClusterRequirementsResponse,
  workloadAndFormValuesToStandaloneRequest,
} from "../../../report/views/cluster-sizer/types";

export type ClusterSizingToolView = "form" | "results" | "edit";

interface FormSnapshot {
  workloadValues: WorkloadFormValues;
  formValues: SizingFormValues;
}

export interface ClusterSizingToolViewModel {
  view: ClusterSizingToolView;
  workloadValues: WorkloadFormValues;
  setWorkloadValues: (values: WorkloadFormValues) => void;
  formValues: SizingFormValues;
  setFormValues: (values: SizingFormValues) => void;
  showWorkerNode: boolean;
  showControlPlane: boolean;
  showControlPlaneScheduling: boolean;
  showSmt: boolean;
  isFormValid: boolean;
  isCalculating: boolean;
  calculateError: Error | undefined;
  sizerOutput: ClusterRequirementsResponse | null;
  calculate: () => Promise<void>;
  startNewRecommendation: () => void;
  cancelEdit: () => void;
}

export const useClusterSizingToolViewModel = (): ClusterSizingToolViewModel => {
  const sizingStore = useInjection<ISizingStore>(Symbols.SizingStore);

  const [workloadValues, setWorkloadValues] = useState<WorkloadFormValues>(
    DEFAULT_WORKLOAD_FORM_VALUES,
  );
  const [formValues, setFormValues] =
    useState<SizingFormValues>(DEFAULT_FORM_VALUES);
  const [view, setView] = useState<ClusterSizingToolView>("form");
  const [sizerOutput, setSizerOutput] =
    useState<ClusterRequirementsResponse | null>(null);
  const [savedFormSnapshot, setSavedFormSnapshot] =
    useState<FormSnapshot | null>(null);
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

  const hasInvalidWorkload =
    workloadValues.totalVMs < 1 ||
    workloadValues.totalCPU < 1 ||
    workloadValues.totalMemory < 1;

  const showWorkerNode =
    formValues.clusterMode === "full-ha" ||
    formValues.clusterMode === "hosted-control-plane";
  const showControlPlane =
    formValues.clusterMode === "full-ha" ||
    formValues.clusterMode === "single-node" ||
    formValues.clusterMode === "compact";
  const showControlPlaneScheduling = formValues.clusterMode === "full-ha";
  const showSmt = smtVisible;
  const isFormValid = !hasSmtError && !hasInvalidWorkload;

  const [calculateState, doCalculate] = useAsyncFn(async () => {
    if (!isFormValid) {
      return;
    }

    setManualCalculateError(undefined);
    setView("results");

    const workerCpu =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].cpu
        : formValues.customCpu;
    const workerMemory =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].memoryGb
        : formValues.customMemoryGb;

    const standaloneClusterRequirementsRequest =
      workloadAndFormValuesToStandaloneRequest(
        workloadValues,
        formValues,
        workerCpu,
        workerMemory,
      );

    try {
      const result = await sizingStore.calculateClusterRequirements({
        standaloneClusterRequirementsRequest,
      });

      setSizerOutput(
        standaloneResponseToClusterRequirementsResponse(result, workloadValues),
      );
      setSavedFormSnapshot({
        workloadValues: { ...workloadValues },
        formValues: { ...formValues },
      });
    } catch (err) {
      if (savedFormSnapshot) {
        setWorkloadValues(savedFormSnapshot.workloadValues);
        setFormValues(savedFormSnapshot.formValues);
      }

      if (err instanceof ResponseError) {
        let responseBody = "";
        try {
          responseBody = await err.response.text();
        } catch {
          responseBody = "";
        }
        const combinedMessage = responseBody
          ? `${err.message}: ${responseBody}`
          : err.message;
        const error = new Error(combinedMessage, {
          cause: responseBody || err,
        });
        setManualCalculateError(error);
        throw error;
      }
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to calculate sizing recommendation");
      setManualCalculateError(error);
      throw error;
    }
  }, [formValues, isFormValid, savedFormSnapshot, sizingStore, workloadValues]);

  const calculate = useCallback(async (): Promise<void> => {
    await doCalculate();
  }, [doCalculate]);

  const startNewRecommendation = useCallback((): void => {
    setView("edit");
  }, []);

  const cancelEdit = useCallback((): void => {
    if (savedFormSnapshot) {
      setWorkloadValues(savedFormSnapshot.workloadValues);
      setFormValues(savedFormSnapshot.formValues);
    }
    setView("results");
  }, [savedFormSnapshot]);

  return {
    view,
    workloadValues,
    setWorkloadValues,
    formValues,
    setFormValues,
    showWorkerNode,
    showControlPlane,
    showControlPlaneScheduling,
    showSmt,
    isFormValid,
    isCalculating: calculateState.loading,
    calculateError: manualCalculateError ?? calculateState.error,
    sizerOutput,
    calculate,
    startNewRecommendation,
    cancelEdit,
  };
};
