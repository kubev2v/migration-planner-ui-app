import React from "react";

import type { UseComplexityToolOptions } from "../../view-models/RecommendationToolOptions";
import { useComplexityToolViewModel } from "../../view-models/useComplexityToolViewModel";
import { getRecommendationToolTitle } from "../migration-recommendations/constants";
import { ComplexityResult } from "./ComplexityResult";
import MigrationComplexityHelpPopover from "./MigrationComplexityHelpPopover";
import { RecommendationToolLayout } from "./RecommendationToolLayout";

interface ComplexityToolViewProps {
  onBack: () => void;
  clusterName: string;
  clusterId: string;
  assessmentId: string;
  options?: Omit<UseComplexityToolOptions, "autoLoad">;
  isReadOnly?: boolean;
}

export const ComplexityToolView: React.FC<ComplexityToolViewProps> = ({
  onBack,
  clusterName,
  clusterId,
  assessmentId,
  options,
  isReadOnly = false,
}) => {
  const {
    complexityEstimation,
    isCalculatingComplexity,
    complexityError,
    estimationByComplexity,
    isCalculatingEstimationByComplexity,
    estimationByComplexityError,
  } = useComplexityToolViewModel(assessmentId, clusterId, {
    ...options,
    autoLoad: !isReadOnly,
  });

  return (
    <RecommendationToolLayout
      title={getRecommendationToolTitle("complexity")}
      onBack={onBack}
      help={<MigrationComplexityHelpPopover />}
    >
      <ComplexityResult
        clusterName={clusterName}
        complexityOutput={complexityEstimation}
        isLoading={isCalculatingComplexity}
        error={complexityError ?? null}
        estimationByComplexity={estimationByComplexity}
        isLoadingEstimationByComplexity={isCalculatingEstimationByComplexity}
        estimationByComplexityError={estimationByComplexityError ?? null}
      />
    </RecommendationToolLayout>
  );
};

ComplexityToolView.displayName = "ComplexityToolView";

export default ComplexityToolView;
