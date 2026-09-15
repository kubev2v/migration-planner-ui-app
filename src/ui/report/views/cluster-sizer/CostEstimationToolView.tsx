import { Alert, Stack, StackItem } from "@patternfly/react-core";
import React, { useCallback, useState } from "react";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../../lib/common/Clipboard";
import type { CostEstimationFormValues } from "../../../../models/CostEstimationModel";
import { GenerateCostEstimationPlainTextOutput } from "../../view-models/GenerateCostEstimationPlainTextOutput";
import { useCostEstimationToolViewModel } from "../../view-models/useCostEstimationToolViewModel";
import { getRecommendationToolTitle } from "../migration-recommendations/constants";
import CostEstimationForm from "./cost-estimation/CostEstimationForm";
import CostEstimationResult, {
  CostEstimationResultSkeleton,
} from "./cost-estimation/CostEstimationResult";
import { type RecommendationPhase } from "./RecommendationTemplate";
import {
  RecommendationToolLayout,
  RecommendationToolResultsActions,
} from "./RecommendationToolLayout";

interface CostEstimationToolViewProps {
  onBack: () => void;
  clusterId: string;
  assessmentId: string;
  isReadOnly?: boolean;
}

export const CostEstimationToolView: React.FC<CostEstimationToolViewProps> = ({
  onBack,
  clusterId,
  assessmentId,
  isReadOnly = false,
}) => {
  const {
    costEstimation,
    isLoadingCostEstimation,
    costEstimationError,
    calculateCostEstimation,
  } = useCostEstimationToolViewModel(assessmentId, clusterId);

  const [phase, setPhase] = useState<RecommendationPhase>(
    isReadOnly ? "results" : "form",
  );
  const [submittedValues, setSubmittedValues] = useState<
    CostEstimationFormValues | undefined
  >(undefined);

  const handleSubmit = useCallback(
    (data: CostEstimationFormValues) => {
      setSubmittedValues(data);
      setPhase("results");
      void calculateCostEstimation(data);
    },
    [calculateCostEstimation],
  );

  const handleCopy = useCallback(() => {
    if (!canCopyToClipboard() || !costEstimation) return;
    copyToClipboard(GenerateCostEstimationPlainTextOutput(costEstimation));
  }, [costEstimation]);

  const handleEdit = useCallback(() => {
    setPhase("form");
  }, []);

  return (
    <RecommendationToolLayout
      title={getRecommendationToolTitle("cost-estimation")}
      onBack={onBack}
      actions={
        phase === "results" ? (
          <RecommendationToolResultsActions
            isReadOnly={isReadOnly}
            isEditDisabled={isLoadingCostEstimation}
            onEdit={handleEdit}
            canCopy={Boolean(costEstimation)}
            onCopy={handleCopy}
          />
        ) : undefined
      }
    >
      {phase === "form" ? (
        <CostEstimationForm
          isLoading={isLoadingCostEstimation}
          onSubmit={handleSubmit}
          defaultValues={submittedValues}
        />
      ) : (
        <Stack hasGutter>
          {costEstimationError ? (
            <StackItem>
              <Alert isInline variant="danger" title="Cost estimation error">
                {costEstimationError.message}
              </Alert>
            </StackItem>
          ) : null}
          {isLoadingCostEstimation ? (
            <StackItem>
              <CostEstimationResultSkeleton />
            </StackItem>
          ) : (
            <StackItem>
              <CostEstimationResult costEstimation={costEstimation} />
            </StackItem>
          )}
        </Stack>
      )}
    </RecommendationToolLayout>
  );
};

CostEstimationToolView.displayName = "CostEstimationToolView";

export default CostEstimationToolView;
