/**
 * Cluster Sizer Types
 *
 * UI-specific types for the cluster sizing wizard.
 * API types are re-exported from @openshift-migration-advisor/planner-sdk.
 *
 * @see ECOPROJECT-3631
 * @see ECOPROJECT-3967 - CPU and memory overcommit specified individually
 */

import {
  type ClusterRequirementsRequest,
  ClusterRequirementsRequestControlPlaneNodeCountEnum,
  type ClusterRequirementsResponse,
  CpuOverCommitRatio,
  MemoryOverCommitRatio,
  type StandaloneClusterRequirementsRequest,
  StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum,
  type StandaloneClusterRequirementsResponse,
} from "@openshift-migration-advisor/planner-sdk";

// Re-export API types from api-client
export type {
  ClusterRequirementsRequest,
  ClusterRequirementsResponse,
  ClusterSizing,
  ComplexityDiskScoreEntry,
  ComplexityOSScoreEntry,
  EstimationDetail,
  InventoryTotals,
  MigrationComplexityRequest,
  MigrationComplexityResponse,
  MigrationEstimationByComplexityResponse,
  MigrationEstimationResponse,
  OptimizationStatus,
  OsDiskEstimationEntry,
  Savings,
  SchemaEstimationResult,
  SizingOverCommitRatio,
  SizingResourceConsumption,
  SizingResourceLimits,
  StandaloneClusterRequirementsRequest,
  StandaloneClusterRequirementsResponse,
} from "@openshift-migration-advisor/planner-sdk";

/**
 * Worker node size preset options
 */
export type WorkerNodePreset = "small" | "medium" | "large" | "custom";

/**
 * Over-commit ratio options for CPU (numeric value)
 */
export type OvercommitRatio = 1 | 2 | 4 | 6 | 8;

/**
 * Over-commit ratio options for memory (1:6 not supported by API)
 */
export type MemoryOvercommitRatio = 1 | 2 | 4;

/**
 * High availability replica count
 */
export type HAReplicaCount = 1 | 2 | 3;

/**
 * Cluster mode types
 */
export type ClusterMode =
  "full-ha" | "compact" | "single-node" | "hosted-control-plane";

/** Cluster modes that only expose control plane sizing inputs (no worker node section). */
export const isControlPlaneOnlyClusterMode = (mode: ClusterMode): boolean =>
  mode === "single-node" || mode === "compact";

/**
 * User input for standalone cluster sizing workload totals (form state)
 */
export interface WorkloadFormValues {
  totalVMs: number;
  totalCPU: number;
  totalMemory: number;
}

/**
 * User input for cluster sizing configuration (form state)
 */
export interface SizingFormValues {
  /** Cluster mode selection */
  clusterMode: ClusterMode;
  /** Selected worker node size preset */
  workerNodePreset: WorkerNodePreset;
  /** Custom CPU cores per worker (when preset is 'custom') */
  customCpu: number;
  /** Custom memory in GB per worker (when preset is 'custom') */
  customMemoryGb: number;
  /** High availability replica count */
  haReplicas: HAReplicaCount;
  /** CPU over-commit ratio for resource sharing */
  cpuOvercommitRatio: OvercommitRatio;
  /** Memory over-commit ratio for resource sharing */
  memoryOvercommitRatio: MemoryOvercommitRatio;
  /** Whether to schedule VMs on control plane nodes */
  scheduleOnControlPlane: boolean;
  /** Whether SMT/Hyperthreading is enabled */
  smtEnabled: boolean;
  /** Number of SMT threads */
  smtThreads: number;
  /** Control plane CPU cores */
  controlPlaneCpu: number;
  /** Control plane memory in GB */
  controlPlaneMemoryGb: number;
}

/**
 * Wizard step identifiers
 */
export type WizardStep = "input" | "result";

/**
 * User input for migration time estimation parameters (form state)
 */
export interface EstimationFormValues {
  /** Network transfer rate in Mbps */
  transferRateMbps: number;
  /** Work hours per day */
  workHoursPerDay: number;
  /** Troubleshooting time per VM in minutes */
  troubleshootMinsPerVm: number;
  /** Number of post-migration engineers */
  postMigrationEngineers: number;
}

/**
 * Convert estimation form values to the params map expected by the API
 */
export const estimationFormToParams = (
  values: EstimationFormValues,
): Record<string, number> => ({
  transfer_rate_mbps: values.transferRateMbps,
  work_hours_per_day: values.workHoursPerDay,
  troubleshoot_mins_per_vm: values.troubleshootMinsPerVm,
  post_migration_engineers: values.postMigrationEngineers,
});

/**
 * Mapping from numeric CPU over-commit ratio to API enum value
 */
const CPU_OVERCOMMIT_RATIO_MAP: Record<
  OvercommitRatio,
  ClusterRequirementsRequest["cpuOverCommitRatio"]
> = {
  1: CpuOverCommitRatio.CpuOneToOne,
  2: CpuOverCommitRatio.CpuOneToTwo,
  4: CpuOverCommitRatio.CpuOneToFour,
  6: CpuOverCommitRatio.CpuOneToSix,
  8: CpuOverCommitRatio.CpuOneToEight,
};

/**
 * Mapping from numeric memory over-commit ratio to API enum value
 */
const MEMORY_OVERCOMMIT_RATIO_MAP: Record<
  MemoryOvercommitRatio,
  ClusterRequirementsRequest["memoryOverCommitRatio"]
> = {
  1: MemoryOverCommitRatio.MemoryOneToOne,
  2: MemoryOverCommitRatio.MemoryOneToTwo,
  4: MemoryOverCommitRatio.MemoryOneToFour,
};

/**
 * Convert numeric CPU over-commit ratio to API enum format
 */
export const cpuOvercommitRatioToApiEnum = (
  ratio: OvercommitRatio,
): ClusterRequirementsRequest["cpuOverCommitRatio"] => {
  return CPU_OVERCOMMIT_RATIO_MAP[ratio];
};

/**
 * Convert numeric memory over-commit ratio to API enum format
 */
export const memoryOvercommitRatioToApiEnum = (
  ratio: MemoryOvercommitRatio,
): ClusterRequirementsRequest["memoryOverCommitRatio"] => {
  return MEMORY_OVERCOMMIT_RATIO_MAP[ratio];
};

/**
 * Mapping from ClusterMode to the API's controlPlaneNodeCount enum.
 * HCP omits the field because the control plane is hosted externally.
 */
const CLUSTER_MODE_TO_NODE_COUNT: Record<
  ClusterMode,
  ClusterRequirementsRequest["controlPlaneNodeCount"] | undefined
> = {
  "full-ha": ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3,
  compact: ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3,
  "single-node": ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
  "hosted-control-plane": undefined,
};

const STANDALONE_CLUSTER_MODE_TO_NODE_COUNT: Record<
  ClusterMode,
  StandaloneClusterRequirementsRequest["controlPlaneNodeCount"] | undefined
> = {
  "full-ha":
    StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3,
  compact:
    StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3,
  "single-node":
    StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
  "hosted-control-plane": undefined,
};

const SNO_DEFAULT_WORKER_CPU = 16;
const SNO_DEFAULT_WORKER_MEMORY = 128;

/**
 * Helper function to convert form values to API request payload.
 *
 * Mode-specific mapping:
 * - Full HA:  all fields sent (worker node, control plane, overcommit, SMT, scheduling)
 * - Compact:  same minimal payload as SNO plus compactMode=true and controlPlaneNodeCount=3
 * - SNO:      minimal payload — controlPlaneSchedulable=true, control plane CPU/memory
 *             from form, workerNodeCPU/Memory use fixed defaults (required by SDK)
 * - HCP:      control-plane fields omitted (hosted externally)
 */
export const formValuesToRequest = (
  clusterId: string,
  values: SizingFormValues,
  workerCpu: number,
  workerMemory: number,
): ClusterRequirementsRequest => {
  const isHCP = values.clusterMode === "hosted-control-plane";
  const isSNO = values.clusterMode === "single-node";
  const isCompact = values.clusterMode === "compact";
  const isFullHA = values.clusterMode === "full-ha";

  if (isSNO || isCompact) {
    return {
      clusterId,
      workerNodeCPU: SNO_DEFAULT_WORKER_CPU,
      workerNodeMemory: SNO_DEFAULT_WORKER_MEMORY,
      controlPlaneSchedulable: true,
      controlPlaneNodeCount: isCompact
        ? ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3
        : ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
      compactMode: isCompact ? true : undefined,
      controlPlaneCPU: values.controlPlaneCpu,
      controlPlaneMemory: values.controlPlaneMemoryGb,
    } as ClusterRequirementsRequest;
  }

  return {
    clusterId,
    cpuOverCommitRatio: cpuOvercommitRatioToApiEnum(values.cpuOvercommitRatio),
    memoryOverCommitRatio: memoryOvercommitRatioToApiEnum(
      values.memoryOvercommitRatio,
    ),
    workerNodeCPU: workerCpu,
    workerNodeMemory: workerMemory,
    workerNodeThreads:
      (isFullHA || isHCP) && values.smtEnabled ? values.smtThreads : undefined,
    hostedControlPlane: isHCP || undefined,
    controlPlaneSchedulable: isFullHA
      ? values.scheduleOnControlPlane
      : undefined,
    controlPlaneCPU: isFullHA ? values.controlPlaneCpu : undefined,
    controlPlaneMemory: isFullHA ? values.controlPlaneMemoryGb : undefined,
    controlPlaneNodeCount: isHCP
      ? undefined
      : CLUSTER_MODE_TO_NODE_COUNT[values.clusterMode],
  };
};

/**
 * Convert workload totals and sizing form values to the standalone API payload.
 *
 * POST /api/v1/cluster-requirements
 */
export const workloadAndFormValuesToStandaloneRequest = (
  workload: WorkloadFormValues,
  values: SizingFormValues,
  workerCpu: number,
  workerMemory: number,
): StandaloneClusterRequirementsRequest => {
  const isHCP = values.clusterMode === "hosted-control-plane";
  const isSNO = values.clusterMode === "single-node";
  const isCompact = values.clusterMode === "compact";
  const isFullHA = values.clusterMode === "full-ha";

  const workloadFields = {
    totalVMs: workload.totalVMs,
    totalCPU: workload.totalCPU,
    totalMemory: workload.totalMemory,
  };

  if (isSNO || isCompact) {
    return {
      ...workloadFields,
      workerNodeCPU: SNO_DEFAULT_WORKER_CPU,
      workerNodeMemory: SNO_DEFAULT_WORKER_MEMORY,
      controlPlaneSchedulable: true,
      controlPlaneNodeCount: isCompact
        ? StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_3
        : StandaloneClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
      compactMode: isCompact ? true : undefined,
      controlPlaneCPU: values.controlPlaneCpu,
      controlPlaneMemory: values.controlPlaneMemoryGb,
    } as StandaloneClusterRequirementsRequest;
  }

  return {
    ...workloadFields,
    cpuOverCommitRatio: cpuOvercommitRatioToApiEnum(values.cpuOvercommitRatio),
    memoryOverCommitRatio: memoryOvercommitRatioToApiEnum(
      values.memoryOvercommitRatio,
    ),
    workerNodeCPU: workerCpu,
    workerNodeMemory: workerMemory,
    workerNodeThreads:
      (isFullHA || isHCP) && values.smtEnabled ? values.smtThreads : undefined,
    hostedControlPlane: isHCP || undefined,
    controlPlaneSchedulable: isFullHA
      ? values.scheduleOnControlPlane
      : undefined,
    controlPlaneCPU: isFullHA ? values.controlPlaneCpu : undefined,
    controlPlaneMemory: isFullHA ? values.controlPlaneMemoryGb : undefined,
    controlPlaneNodeCount: isHCP
      ? undefined
      : STANDALONE_CLUSTER_MODE_TO_NODE_COUNT[values.clusterMode],
  };
};

/**
 * Map standalone sizing response to ClusterRequirementsResponse for SizingResult.
 */
export const standaloneResponseToClusterRequirementsResponse = (
  response: StandaloneClusterRequirementsResponse,
  workload: WorkloadFormValues,
): ClusterRequirementsResponse => ({
  clusterSizing: response.clusterSizing,
  resourceConsumption: response.resourceConsumption,
  inventoryTotals: {
    totalVMs: workload.totalVMs,
    totalCPU: workload.totalCPU,
    totalMemory: workload.totalMemory,
  },
});
