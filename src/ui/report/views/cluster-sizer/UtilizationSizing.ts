import type {
  ClusterRequirementsResponse,
  ClusterSizing,
  Savings,
} from "./types";

const CONFIDENCE_THRESHOLD = 50;

/** Matches API `optimizationStatus.reason` when utilization optimization succeeded. */
const OPTIMIZATION_SUCCESS_REASON = "success" as const;

export type UtilizationComparisonResponse = ClusterRequirementsResponse & {
  optimizedSizing: ClusterSizing;
  savings: Savings;
};

export const hasUtilizationComparison = (
  output: ClusterRequirementsResponse | null | undefined,
): output is UtilizationComparisonResponse =>
  output != null &&
  output.optimizationStatus?.reason === OPTIMIZATION_SUCCESS_REASON &&
  output.optimizedSizing != null &&
  output.savings != null &&
  (output.optimizedSizing.confidence ?? 0) >= CONFIDENCE_THRESHOLD;

export const getOptimizationStatusMessage = (
  output: ClusterRequirementsResponse,
): string | undefined => {
  if (hasUtilizationComparison(output) || !output.optimizationStatus) {
    return undefined;
  }

  switch (output.optimizationStatus.reason) {
    case "no_utilization_data":
      return "Actual usage data is not available for this cluster. Showing sizing based on 100% allocation.";
    case "low_confidence":
      return "Utilization data confidence is below 50%. Showing sizing based on 100% allocation.";
    case "calculation_error":
      return "Optimized sizing could not be calculated. Showing sizing based on 100% allocation.";
    default:
      return undefined;
  }
};

export const formatUtilizationPercent = (value: number | undefined): string =>
  value == null ? "—" : `${value.toFixed(1)}%`;

export const computeEffectiveCpu = (
  inventoryTotalCpu: number,
  utilizationPercent: number | undefined,
): number =>
  utilizationPercent == null
    ? inventoryTotalCpu
    : Math.round(inventoryTotalCpu * (utilizationPercent / 100));

export const computeEffectiveMemory = (
  inventoryTotalMemory: number,
  utilizationPercent: number | undefined,
): number =>
  utilizationPercent == null
    ? inventoryTotalMemory
    : Math.round(inventoryTotalMemory * (utilizationPercent / 100));
