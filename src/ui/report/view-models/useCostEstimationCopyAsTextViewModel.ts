import { useCallback } from "react";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../lib/common/Clipboard";
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
  const canCopy = canCopyToClipboard();

  const handleCopy = useCallback(() => {
    if (!canCopy || costEstimation === null) {
      return;
    }
    copyToClipboard(GenerateCostEstimationPlainTextOutput(costEstimation));
  }, [canCopy, costEstimation]);

  return { canCopy, handleCopy };
}
