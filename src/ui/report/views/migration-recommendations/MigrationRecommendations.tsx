import React from "react";

import type { UseClusterSizingWizardOptions } from "../../view-models/RecommendationToolOptions";
import { ClusterSizingWizard } from "../cluster-sizer/ClusterSizingWizard";
import type {
  ClusterRequirementsResponse,
  SizingFormValues,
} from "../cluster-sizer/types";
import { getRecommendationToolCards } from "./constants";
import { RecommendationToolsLanding } from "./RecommendationToolsLanding";
import type { RecommendationToolId } from "./types";

export interface MigrationRecommendationsProps {
  selectedTool: RecommendationToolId | null;
  onSelectTool: (toolId: RecommendationToolId) => void;
  onBack: () => void;
  isAggregateView: boolean;
  areToolsDisabled?: boolean;
  canOpenArchitecture?: boolean;
  clusterName: string;
  clusterId: string;
  assessmentId: string;
  onCalculated?: (
    result: ClusterRequirementsResponse,
    formValues: SizingFormValues,
  ) => void;
  options?: UseClusterSizingWizardOptions;
  isReadOnly?: boolean;
}

export const MigrationRecommendations: React.FC<
  MigrationRecommendationsProps
> = ({
  selectedTool,
  onSelectTool,
  onBack,
  isAggregateView,
  areToolsDisabled = false,
  canOpenArchitecture = true,
  clusterName,
  clusterId,
  assessmentId,
  onCalculated,
  options,
  isReadOnly = false,
}) => {
  if (!selectedTool) {
    const tools = getRecommendationToolCards(isAggregateView).map((card) =>
      card.id === "architecture" && !canOpenArchitecture
        ? { ...card, isDisabled: true }
        : card,
    );
    return (
      <RecommendationToolsLanding
        tools={tools}
        onSelectTool={onSelectTool}
        areToolsDisabled={areToolsDisabled}
      />
    );
  }

  return (
    <ClusterSizingWizard
      key={`${clusterId}-${selectedTool}`}
      tool={selectedTool}
      onBack={onBack}
      clusterName={clusterName}
      clusterId={clusterId}
      assessmentId={assessmentId}
      onCalculated={onCalculated}
      options={options}
      isReadOnly={isReadOnly}
    />
  );
};

MigrationRecommendations.displayName = "MigrationRecommendations";

export default MigrationRecommendations;
