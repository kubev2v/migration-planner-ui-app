import { Button } from "@patternfly/react-core";
import { RhUiCopyIcon } from "@patternfly/react-icons";
import React, { useCallback } from "react";

import type { CostEstimationResponse } from "../../../../../models/CostEstimationModel";
import { generateCostEstimationPlainTextOutput } from "./generateCostEstimationPlainTextOutput";

interface CostEstimationCopyAsTextButtonProps {
  costEstimation: CostEstimationResponse | null;
}

export const CostEstimationCopyAsTextButton: React.FC<
  CostEstimationCopyAsTextButtonProps
> = ({ costEstimation }) => {
  const canCopy =
    typeof navigator.clipboard?.writeText === "function" &&
    (typeof window === "undefined" || window.isSecureContext);

  const handleCopy = useCallback(() => {
    if (!canCopy || costEstimation === null) {
      return;
    }
    navigator.clipboard
      .writeText(generateCostEstimationPlainTextOutput(costEstimation))
      .catch((err: unknown) => {
        console.error("Failed to copy cost estimation to clipboard", err);
      });
  }, [canCopy, costEstimation]);

  if (!costEstimation) {
    return null;
  }

  return (
    <Button
      variant="link"
      icon={<RhUiCopyIcon />}
      iconPosition="end"
      onClick={handleCopy}
      isDisabled={!canCopy}
    >
      Copy as plain text
    </Button>
  );
};

CostEstimationCopyAsTextButton.displayName = "CostEstimationCopyAsTextButton";

export default CostEstimationCopyAsTextButton;
