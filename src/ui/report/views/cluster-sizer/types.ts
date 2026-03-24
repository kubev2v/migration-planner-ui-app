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
  ClusterRequirementsRequestCpuOverCommitRatioEnum,
  ClusterRequirementsRequestMemoryOverCommitRatioEnum,
} from "@openshift-migration-advisor/planner-sdk";

// Re-export API types from api-client
export type {
  ClusterRequirementsRequest,
  ClusterRequirementsResponse,
  ClusterSizing,
  ComplexityDiskScoreEntry,
  ComplexityOSScoreEntry,
  InventoryTotals,
  MigrationComplexityRequest,
  MigrationComplexityResponse,
  SizingOverCommitRatio,
  SizingResourceConsumption,
  SizingResourceLimits,
} from "@openshift-migration-advisor/planner-sdk";

/**
 * Worker node size preset options
 */
export type WorkerNodePreset = "small" | "medium" | "large" | "custom";

/**
 * Over-commit ratio options for CPU (numeric value)
 */
export type OvercommitRatio = 1 | 2 | 4 | 6;

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
export type ClusterMode = "full-ha" | "single-node" | "hosted-control-plane";

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
 * Mapping from numeric CPU over-commit ratio to API enum value
 */
const CPU_OVERCOMMIT_RATIO_MAP: Record<
  OvercommitRatio,
  ClusterRequirementsRequest["cpuOverCommitRatio"]
> = {
  1: ClusterRequirementsRequestCpuOverCommitRatioEnum.CpuOneToOne,
  2: ClusterRequirementsRequestCpuOverCommitRatioEnum.CpuOneToTwo,
  4: ClusterRequirementsRequestCpuOverCommitRatioEnum.CpuOneToFour,
  6: ClusterRequirementsRequestCpuOverCommitRatioEnum.CpuOneToSix,
};

/**
 * Mapping from numeric memory over-commit ratio to API enum value
 */
const MEMORY_OVERCOMMIT_RATIO_MAP: Record<
  MemoryOvercommitRatio,
  ClusterRequirementsRequest["memoryOverCommitRatio"]
> = {
  1: ClusterRequirementsRequestMemoryOverCommitRatioEnum.MemoryOneToOne,
  2: ClusterRequirementsRequestMemoryOverCommitRatioEnum.MemoryOneToTwo,
  4: ClusterRequirementsRequestMemoryOverCommitRatioEnum.MemoryOneToFour,
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
  "single-node": ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
  "hosted-control-plane": undefined,
};

const SNO_DEFAULT_WORKER_CPU = 16;
const SNO_DEFAULT_WORKER_MEMORY = 128;

/**
 * Helper function to convert form values to API request payload.
 *
 * Mode-specific mapping:
 * - Full HA:  all fields sent (worker node, control plane, overcommit, SMT, scheduling)
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
  const isFullHA = values.clusterMode === "full-ha";

  if (isSNO) {
    return {
      clusterId,
      workerNodeCPU: SNO_DEFAULT_WORKER_CPU,
      workerNodeMemory: SNO_DEFAULT_WORKER_MEMORY,
      controlPlaneSchedulable: true,
      controlPlaneNodeCount:
        ClusterRequirementsRequestControlPlaneNodeCountEnum.NUMBER_1,
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
      isFullHA && values.smtEnabled ? values.smtThreads : undefined,
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
