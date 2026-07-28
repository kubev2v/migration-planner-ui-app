import { useCallback } from "react";

import type { CostEstimationResponse } from "../../../models/CostEstimationModel";
import { GenerateCostEstimationPlainTextOutput } from "./GenerateCostEstimationPlainTextOutput";

export interface UseCostEstimationCopyAsTextViewModelArgs {
  costEstimation: CostEstimationResponse | null;
}

export interface CostEstimationCopyAsTextViewModel {
  canCopy: boolean;
  handleCopy: () => void;
}

export function useCostEstimationCopyAsTextViewModel({
  costEstimation,
}: UseCostEstimationCopyAsTextViewModelArgs): CostEstimationCopyAsTextViewModel {
  const canCopy =
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function" &&
    (typeof window === "undefined" || window.isSecureContext);

  const handleCopy = useCallback(() => {
    if (!canCopy || costEstimation === null) {
      return;
    }
    navigator.clipboard
      .writeText(GenerateCostEstimationPlainTextOutput(costEstimation))
      .catch((err: unknown) => {
        console.error("Failed to copy cost estimation to clipboard", err);
      });
  }, [canCopy, costEstimation]);

  return { canCopy, handleCopy };
}
