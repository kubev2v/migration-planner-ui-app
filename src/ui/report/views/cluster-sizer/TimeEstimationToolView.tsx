import React, { useCallback, useState } from "react";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../../lib/common/Clipboard";
import type { UseTimeEstimationToolOptions } from "../../view-models/RecommendationToolOptions";
import { useTimeEstimationToolViewModel } from "../../view-models/useTimeEstimationToolViewModel";
import { getRecommendationToolTitle } from "../migration-recommendations/constants";
import {
  type RecommendationPhase,
  RecommendationTemplate,
} from "./RecommendationTemplate";
import {
  RecommendationToolLayout,
  RecommendationToolResultsActions,
} from "./RecommendationToolLayout";
import { TimeEstimationForm } from "./TimeEstimationForm";
import {
  generateTimeEstimationPlainText,
  TimeEstimationResult,
} from "./TimeEstimationResult";

interface TimeEstimationToolViewProps {
  onBack: () => void;
  clusterName: string;
  clusterId: string;
  assessmentId: string;
  options?: UseTimeEstimationToolOptions;
  isReadOnly?: boolean;
}

export const TimeEstimationToolView: React.FC<TimeEstimationToolViewProps> = ({
  onBack,
  clusterName,
  clusterId,
  assessmentId,
  options,
  isReadOnly = false,
}) => {
  const {
    estimationFormValues,
    setEstimationFormValues,
    migrationEstimation,
    isCalculatingEstimation,
    estimationError,
    calculateEstimation,
  } = useTimeEstimationToolViewModel(assessmentId, clusterId, options);

  const [phase, setPhase] = useState<RecommendationPhase>(
    isReadOnly ? "results" : "form",
  );

  const handleCalculate = useCallback(() => {
    void calculateEstimation();
  }, [calculateEstimation]);

  const handleCopy = useCallback(() => {
    if (!canCopyToClipboard() || !migrationEstimation) return;
    copyToClipboard(generateTimeEstimationPlainText(migrationEstimation));
  }, [migrationEstimation]);

  const handleEdit = useCallback(() => {
    setPhase("form");
  }, []);

  return (
    <RecommendationToolLayout
      title={getRecommendationToolTitle("time-estimation")}
      onBack={onBack}
      actions={
        phase === "results" ? (
          <RecommendationToolResultsActions
            isReadOnly={isReadOnly}
            isEditDisabled={isCalculatingEstimation}
            onEdit={handleEdit}
            canCopy={Boolean(migrationEstimation)}
            onCopy={handleCopy}
          />
        ) : undefined
      }
    >
      <RecommendationTemplate
        id="time-estimation"
        preferencesContent={
          <TimeEstimationForm
            values={estimationFormValues}
            onChange={setEstimationFormValues}
          />
        }
        resultsContent={
          <TimeEstimationResult
            clusterName={clusterName}
            estimationOutput={migrationEstimation}
            isLoading={isCalculatingEstimation}
            error={estimationError ?? null}
          />
        }
        onGenerate={handleCalculate}
        isLoading={isCalculatingEstimation}
        hasResults={Boolean(
          migrationEstimation || isCalculatingEstimation || estimationError,
        )}
        generateButtonText="Calculate"
        resultsTitle=""
        showAlert={false}
        hasError={Boolean(estimationError)}
        isPreferencesDisabled={isReadOnly}
        initialShowResults={isReadOnly}
        phase={phase}
        onPhaseChange={setPhase}
        hideResultsToolbar
      />
    </RecommendationToolLayout>
  );
};

TimeEstimationToolView.displayName = "TimeEstimationToolView";

export default TimeEstimationToolView;
