import React from "react";

import type { UseClusterSizingWizardOptions } from "../../view-models/RecommendationToolOptions";
import type { RecommendationToolId } from "../migration-recommendations/types";
import { ArchitectureToolView } from "./ArchitectureToolView";
import { ComplexityToolView } from "./ComplexityToolView";
import { TimeEstimationToolView } from "./TimeEstimationToolView";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";

interface ClusterSizingWizardProps {
  tool: RecommendationToolId;
  onBack: () => void;
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

export const ClusterSizingWizard: React.FC<ClusterSizingWizardProps> = ({
  tool,
  onBack,
  clusterName,
  clusterId,
  assessmentId,
  onCalculated,
  options,
  isReadOnly = false,
}) => {
  switch (tool) {
    case "architecture":
      return (
        <ArchitectureToolView
          onBack={onBack}
          clusterName={clusterName}
          clusterId={clusterId}
          assessmentId={assessmentId}
          onCalculated={onCalculated}
          options={options}
          isReadOnly={isReadOnly}
        />
      );
    case "time-estimation":
      return (
        <TimeEstimationToolView
          onBack={onBack}
          clusterName={clusterName}
          clusterId={clusterId}
          assessmentId={assessmentId}
          options={options}
          isReadOnly={isReadOnly}
        />
      );
    case "complexity":
      return (
        <ComplexityToolView
          onBack={onBack}
          clusterName={clusterName}
          clusterId={clusterId}
          assessmentId={assessmentId}
          options={options}
          isReadOnly={isReadOnly}
        />
      );
    default:
      return null;
  }
};

ClusterSizingWizard.displayName = "ClusterSizingWizard";

export default ClusterSizingWizard;
