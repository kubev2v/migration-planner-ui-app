import {
  Alert,
  Card,
  CardBody,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React, { useCallback, useState } from "react";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../../lib/common/Clipboard";
import type { CostEstimationFormValues } from "../../../../models/CostEstimationModel";
import { ToolLayout } from "../../../core/components/ToolLayout";
import { GenerateCostEstimationPlainTextOutput } from "../../view-models/GenerateCostEstimationPlainTextOutput";
import { useCostEstimationToolViewModel } from "../../view-models/useCostEstimationToolViewModel";
import { getRecommendationToolTitle } from "../migration-recommendations/constants";
import CostEstimationForm from "./cost-estimation/CostEstimationForm";
import CostEstimationResult, {
  CostEstimationResultSkeleton,
} from "./cost-estimation/CostEstimationResult";
import { type RecommendationPhase } from "./RecommendationTemplate";
import RecommendationToolActions from "./RecommendationToolActions";

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
    <ToolLayout
      title={getRecommendationToolTitle("cost-estimation")}
      onBack={onBack}
      actions={
        phase === "results" ? (
          <RecommendationToolActions
            isReadOnly={isReadOnly}
            isEditDisabled={isLoadingCostEstimation}
            onEdit={handleEdit}
            canCopy={Boolean(costEstimation)}
            onCopy={handleCopy}
          />
        ) : undefined
      }
    >
      <Card>
        <CardBody>
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
                  <Alert
                    isInline
                    variant="danger"
                    title="Cost estimation error"
                  >
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
        </CardBody>
      </Card>
    </ToolLayout>
  );
};

CostEstimationToolView.displayName = "CostEstimationToolView";

export default CostEstimationToolView;
