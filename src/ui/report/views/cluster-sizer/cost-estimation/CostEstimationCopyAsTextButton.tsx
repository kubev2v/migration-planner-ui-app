import { Button } from "@patternfly/react-core";
import { RhUiCopyIcon } from "@patternfly/react-icons";
import React from "react";

import type { CostEstimationResponse } from "../../../../../models/CostEstimationModel";
import { useCostEstimationCopyAsTextViewModel } from "../../../view-models/useCostEstimationCopyAsTextViewModel";

interface CostEstimationCopyAsTextButtonProps {
  costEstimation: CostEstimationResponse | null;
}

export const CostEstimationCopyAsTextButton: React.FC<
  CostEstimationCopyAsTextButtonProps
> = ({ costEstimation }) => {
  const { canCopy, handleCopy } = useCostEstimationCopyAsTextViewModel({
    costEstimation,
  });

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
