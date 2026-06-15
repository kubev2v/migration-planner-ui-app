import { useMemo } from "react";

import type {
  ClusterSizing,
  InventoryTotals,
  Savings,
  SizingFormValues,
} from "../views/cluster-sizer/types";
import {
  computeEffectiveCpu,
  computeEffectiveMemory,
} from "../views/cluster-sizer/UtilizationSizing";

export interface UseUtilizationComparisonDataParams {
  formValues: SizingFormValues;
  optimizedSizing: ClusterSizing;
  inventoryTotals: InventoryTotals;
  savings: Savings;
}

export interface UtilizationComparisonData {
  isSNO: boolean;
  cpuUtilization: number | undefined;
  memoryUtilization: number | undefined;
  effectiveCpu: number;
  effectiveMemory: number;
  savingsPercent: number;
}

export const useUtilizationComparisonData = ({
  formValues,
  optimizedSizing,
  inventoryTotals,
  savings,
}: UseUtilizationComparisonDataParams): UtilizationComparisonData =>
  useMemo(() => {
    const cpuUtilization = optimizedSizing.cpuUtilizationMax;
    const memoryUtilization = optimizedSizing.memoryUtilizationMax;

    return {
      isSNO: formValues.clusterMode === "single-node",
      cpuUtilization,
      memoryUtilization,
      effectiveCpu: computeEffectiveCpu(
        inventoryTotals.totalCPU,
        cpuUtilization,
      ),
      effectiveMemory: computeEffectiveMemory(
        inventoryTotals.totalMemory,
        memoryUtilization,
      ),
      savingsPercent: Math.round(savings.percentageReduction),
    };
  }, [formValues.clusterMode, inventoryTotals, optimizedSizing, savings]);
