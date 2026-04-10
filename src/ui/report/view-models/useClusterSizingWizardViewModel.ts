import type {
  MigrationComplexityResponse,
  MigrationEstimationByComplexityResponse,
} from "@openshift-migration-advisor/planner-sdk";
import { ResponseError } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
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
  MigrationEstimationResponse,
  SizingFormValues,
} from "../views/cluster-sizer/types";
import { formValuesToRequest } from "../views/cluster-sizer/types";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ClusterSizingWizardViewModel {
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
  migrationEstimation: MigrationEstimationResponse | null;
  isCalculatingEstimation: boolean;
  estimationError: Error | undefined;
  calculateEstimation: () => Promise<void>;
  complexityEstimation: MigrationComplexityResponse | null;
  isCalculatingComplexity: boolean;
  complexityError: Error | undefined;
  calculateComplexity: () => Promise<void>;
  estimationByComplexity: MigrationEstimationByComplexityResponse | null;
  isCalculatingEstimationByComplexity: boolean;
  estimationByComplexityError: Error | undefined;
  isFormValid: boolean;
  ensureEstimationForMenu: (menuItem: string | null) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useClusterSizingWizardViewModel = (
  assessmentId: string,
  clusterId: string,
): ClusterSizingWizardViewModel => {
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const [formValues, setFormValues] =
    useState<SizingFormValues>(DEFAULT_FORM_VALUES);
  const [sizerOutput, setSizerOutput] =
    useState<ClusterRequirementsResponse | null>(null);
  const [migrationEstimation, setMigrationEstimation] =
    useState<MigrationEstimationResponse | null>(null);
  const [complexityEstimation, setComplexityEstimation] =
    useState<MigrationComplexityResponse | null>(null);
  const [estimationByComplexity, setEstimationByComplexity] =
    useState<MigrationEstimationByComplexityResponse | null>(null);
  const [manualCalculateError, setManualCalculateError] = useState<
    Error | undefined
  >(undefined);
  const [manualEstimationError, setManualEstimationError] = useState<
    Error | undefined
  >(undefined);
  const [manualComplexityError, setManualComplexityError] = useState<
    Error | undefined
  >(undefined);
  const [manualEstByComplexityError, setManualEstByComplexityError] = useState<
    Error | undefined
  >(undefined);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const latestComplexityRequestIdRef = useRef<string>("");

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
    // Get worker node CPU and memory based on preset or custom values
    const workerCpu =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].cpu
        : formValues.customCpu;
    const workerMemory =
      formValues.workerNodePreset !== "custom"
        ? WORKER_NODE_PRESETS[formValues.workerNodePreset].memoryGb
        : formValues.customMemoryGb;

    // Build the API request payload
    const clusterRequirementsRequest = formValuesToRequest(
      clusterId,
      formValues,
      workerCpu,
      workerMemory,
    );

    try {
      // POST /api/v1/assessments/{id}/cluster-requirements
      const result =
        await assessmentsStore.calculateAssessmentClusterRequirements({
          id: assessmentId,
          clusterRequirementsRequest,
        });

      setSizerOutput(result);
    } catch (err) {
      if (err instanceof ResponseError) {
        const message = await err.response.text();
        const combinedMessage = message
          ? `${err.message}: ${message}`
          : err.message;
        const error = new Error(combinedMessage, { cause: message });
        setManualCalculateError(error);
        throw error;
      }
      const error =
        err instanceof Error ? err : new Error("Failed to calculate sizing");
      setManualCalculateError(error);
      throw error;
    }
  }, [assessmentId, assessmentsStore, clusterId, formValues]);

  const [estimationState, doCalculateEstimation] = useAsyncFn(async () => {
    setManualEstimationError(undefined);
    try {
      const result = await assessmentsStore.calculateMigrationEstimation({
        id: assessmentId,
        migrationEstimationRequest: { clusterId },
      });

      const hasSchemas = result && Object.keys(result).length > 0;
      setMigrationEstimation(hasSchemas ? result : null);
    } catch (err) {
      if (err instanceof ResponseError) {
        const message = await err.response.text();
        const combinedMessage = message
          ? `${err.message}: ${message}`
          : err.message;
        const error = new Error(combinedMessage, { cause: message });
        setManualEstimationError(error);
        throw error;
      }
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to calculate migration estimation");
      setManualEstimationError(error);
      throw error;
    }
  }, [assessmentId, assessmentsStore, clusterId]);

  const [complexityState, doCalculateComplexity] = useAsyncFn(async () => {
    setManualComplexityError(undefined);
    const requestId = `${assessmentId}-${clusterId}-${Date.now()}`;
    latestComplexityRequestIdRef.current = requestId;

    try {
      const result = await assessmentsStore.calculateComplexityEstimation({
        id: assessmentId,
        migrationComplexityRequest: { clusterId },
      });

      if (latestComplexityRequestIdRef.current === requestId) {
        setComplexityEstimation(result);
      }
    } catch (err) {
      if (latestComplexityRequestIdRef.current !== requestId) {
        return;
      }

      if (err instanceof ResponseError) {
        const message = await err.response.text();
        const combinedMessage = message
          ? `${err.message}: ${message}`
          : err.message;
        const error = new Error(combinedMessage, { cause: message });
        setManualComplexityError(error);
        throw error;
      }
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to calculate complexity estimation");
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
            clusterId,
            estimationSchema: ["network-based", "storage-offload"],
            params: {
              work_hours_per_day: 6,
              post_migration_engineers: 4,
              transfer_rate_mbps: 600,
            },
          },
        });
        setEstimationByComplexity(result);
      } catch (err) {
        if (err instanceof ResponseError) {
          const message = await err.response.text();
          const combinedMessage = message
            ? `${err.message}: ${message}`
            : err.message;
          const error = new Error(combinedMessage, { cause: message });
          setManualEstByComplexityError(error);
          throw error;
        }
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to calculate estimation by complexity");
        setManualEstByComplexityError(error);
        throw error;
      }
    }, [assessmentId, assessmentsStore, clusterId]);

  const ensureEstimationForMenu = useCallback(
    (menuItem: string | null) => {
      if (
        menuItem === "time-estimation" &&
        !migrationEstimation &&
        !estimationState.loading &&
        !manualEstimationError
      ) {
        void doCalculateEstimation();
      }
      if (menuItem === "complexity") {
        if (
          !complexityEstimation &&
          !complexityState.loading &&
          !manualComplexityError
        ) {
          void doCalculateComplexity();
        }
        if (
          !estimationByComplexity &&
          !estByComplexityState.loading &&
          !manualEstByComplexityError
        ) {
          void doCalculateEstimationByComplexity();
        }
      }
    },
    [
      migrationEstimation,
      estimationState.loading,
      manualEstimationError,
      doCalculateEstimation,
      complexityEstimation,
      complexityState.loading,
      manualComplexityError,
      doCalculateComplexity,
      estimationByComplexity,
      estByComplexityState.loading,
      manualEstByComplexityError,
      doCalculateEstimationByComplexity,
    ],
  );

  const reset = useCallback(() => {
    setFormValues(DEFAULT_FORM_VALUES);
    setSizerOutput(null);
    setMigrationEstimation(null);
    setComplexityEstimation(null);
    setEstimationByComplexity(null);
    setManualCalculateError(undefined);
    setManualEstimationError(undefined);
    setManualComplexityError(undefined);
    setManualEstByComplexityError(undefined);
    setResetCounter((prev) => prev + 1);
  }, []);

  const showWorkerNode =
    formValues.clusterMode === "full-ha" ||
    formValues.clusterMode === "hosted-control-plane";
  const showControlPlane =
    formValues.clusterMode === "full-ha" ||
    formValues.clusterMode === "single-node";
  const showControlPlaneScheduling = formValues.clusterMode === "full-ha";
  const showSmt = smtVisible;

  const isFormValid = !hasSmtError;

  return {
    formValues,
    setFormValues,
    showWorkerNode,
    showControlPlane,
    showControlPlaneScheduling,
    showSmt,
    sizerOutput,
    isCalculating: calculateState.loading,
    calculateError:
      manualCalculateError ??
      (resetCounter > 0 ? undefined : calculateState.error),
    calculate: doCalculate,
    migrationEstimation,
    isCalculatingEstimation: estimationState.loading,
    estimationError:
      manualEstimationError ??
      (resetCounter > 0 ? undefined : estimationState.error),
    calculateEstimation: doCalculateEstimation,
    complexityEstimation,
    isCalculatingComplexity: complexityState.loading,
    complexityError:
      manualComplexityError ??
      (resetCounter > 0 ? undefined : complexityState.error),
    calculateComplexity: doCalculateComplexity,
    estimationByComplexity,
    isCalculatingEstimationByComplexity: estByComplexityState.loading,
    estimationByComplexityError:
      manualEstByComplexityError ??
      (resetCounter > 0 ? undefined : estByComplexityState.error),
    isFormValid,
    ensureEstimationForMenu,
    reset,
  };
};
