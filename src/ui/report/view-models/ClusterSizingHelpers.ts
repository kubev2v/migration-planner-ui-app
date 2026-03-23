import {
  CPU_OVERCOMMIT_OPTIONS,
  MEMORY_OVERCOMMIT_OPTIONS,
} from "../views/cluster-sizer/constants";
import type {
  ClusterRequirementsResponse,
  SizingFormValues,
} from "../views/cluster-sizer/types";

const DISCLAIMER_TEXT =
  "Note: Resource requirements are estimates based on current workloads. Please verify this architecture with your SME team to ensure optimal performance.";

export const formatNumber = (value: number): string => value.toLocaleString();

export const formatRatio = (value: number): string => value.toFixed(2);

export const getCpuOvercommitLabel = (ratio: number): string => {
  const option = CPU_OVERCOMMIT_OPTIONS.find((opt) => opt.value === ratio);
  return option?.label || `1:${ratio}`;
};

export const getMemoryOvercommitLabel = (ratio: number): string => {
  const option = MEMORY_OVERCOMMIT_OPTIONS.find((opt) => opt.value === ratio);
  return option?.label || `1:${ratio}`;
};

export const generatePlainTextRecommendation = (
  clusterName: string,
  formValues: SizingFormValues,
  output: ClusterRequirementsResponse,
): string => {
  const isSNO = formValues.clusterMode === "single-node";

  if (isSNO) {
    return `
Cluster: ${clusterName}
Target Platform: Bare Metal
Total Nodes: ${output.clusterSizing.totalNodes}
Node Size: ${formValues.controlPlaneCpu} CPU / ${formValues.controlPlaneMemoryGb} GB
VMs to Migrate: ${formatNumber(output.inventoryTotals.totalVMs)} VMs
VM resources (request): ${formatNumber(output.inventoryTotals.totalCPU)} CPU / ${formatNumber(output.inventoryTotals.totalMemory)} GB

${DISCLAIMER_TEXT}
`.trim();
  }

  const cpuOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = output.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = output.resourceConsumption.limits?.memory ?? 0;

  const hasControlPlane = output.clusterSizing.controlPlaneNodes > 0;

  const controlPlaneLine = hasControlPlane
    ? `\nControl Plane Node Size: ${formValues.controlPlaneCpu} CPU / ${formValues.controlPlaneMemoryGb} GB (${output.clusterSizing.controlPlaneNodes} nodes)`
    : "";

  return `
Cluster: ${clusterName}
Total Nodes: ${output.clusterSizing.totalNodes} (${output.clusterSizing.workerNodes} workers + ${output.clusterSizing.controlPlaneNodes} control plane)
Failover Capacity: ${output.clusterSizing.failoverNodes} failover nodes
Worker Node Size: ${formValues.customCpu} CPU / ${formValues.customMemoryGb} GB${controlPlaneLine}

Additional info
Target Platform: Bare Metal
OverCommitment: CPU ${getCpuOvercommitLabel(formValues.cpuOvercommitRatio)}, Memory ${getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}
VMs to Migrate: ${formatNumber(output.inventoryTotals.totalVMs)} VMs
- CPU Over-Commit Ratio: ${formatRatio(cpuOverCommitRatio)}
- Memory Over-Commit Ratio: ${formatRatio(memoryOverCommitRatio)}
Resource Breakdown
VM resources (request): ${formatNumber(output.inventoryTotals.totalCPU)} CPU / ${formatNumber(output.inventoryTotals.totalMemory)} GB
With Over-commit (limits): ${formatNumber(cpuLimits)} CPU / ${formatNumber(memoryLimits)} GB
Physical Capacity: ${formatNumber(output.clusterSizing.totalCPU)} CPU / ${formatNumber(output.clusterSizing.totalMemory)} GB

${DISCLAIMER_TEXT}
`.trim();
};
