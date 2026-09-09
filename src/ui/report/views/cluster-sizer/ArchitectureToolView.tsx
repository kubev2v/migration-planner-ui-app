import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../../lib/common/Clipboard";
import { generatePlainTextRecommendation } from "../../view-models/ClusterSizingHelpers";
import type { UseArchitectureToolOptions } from "../../view-models/RecommendationToolOptions";
import { useArchitectureToolViewModel } from "../../view-models/useArchitectureToolViewModel";
import { getRecommendationToolTitle } from "../migration-recommendations/constants";
import {
  type RecommendationPhase,
  RecommendationTemplate,
} from "./RecommendationTemplate";
import {
  RecommendationToolLayout,
  RecommendationToolResultsActions,
} from "./RecommendationToolLayout";
import { SizingInputForm } from "./SizingInputForm";
import { SizingResult } from "./SizingResult";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";
import { hasUtilizationComparison } from "./UtilizationSizing";

interface ArchitectureToolViewProps {
  onBack: () => void;
  clusterName: string;
  clusterId: string;
  assessmentId: string;
  onCalculated?: (
    result: ClusterRequirementsResponse,
    formValues: SizingFormValues,
  ) => void;
  options?: UseArchitectureToolOptions;
  isReadOnly?: boolean;
}

export const ArchitectureToolView: React.FC<ArchitectureToolViewProps> = ({
  onBack,
  clusterName,
  clusterId,
  assessmentId,
  onCalculated,
  options,
  isReadOnly = false,
}) => {
  const {
    formValues,
    setFormValues,
    showWorkerNode,
    showControlPlane,
    showControlPlaneScheduling,
    showSmt,
    sizerOutput,
    isCalculating,
    calculateError,
    calculate,
    isFormValid,
  } = useArchitectureToolViewModel(assessmentId, clusterId, options);

  const [phase, setPhase] = useState<RecommendationPhase>(
    isReadOnly ? "results" : "form",
  );

  useEffect(() => {
    if (sizerOutput && onCalculated) {
      onCalculated(sizerOutput, formValues);
    }
    // Only fire when sizerOutput changes (not on every formValues keystroke)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizerOutput]);

  const handleCalculate = useCallback(() => {
    void calculate();
  }, [calculate]);

  const plainTextRecommendation = useMemo(() => {
    if (!sizerOutput) return "";
    return generatePlainTextRecommendation(
      clusterName,
      formValues,
      sizerOutput,
    );
  }, [clusterName, formValues, sizerOutput]);

  const handleCopy = useCallback(() => {
    if (!canCopyToClipboard()) return;
    copyToClipboard(plainTextRecommendation);
  }, [plainTextRecommendation]);

  const handleEdit = useCallback(() => {
    setPhase("form");
  }, []);

  const title =
    phase === "results"
      ? "Cluster recommendations"
      : getRecommendationToolTitle("architecture");

  return (
    <RecommendationToolLayout
      title={title}
      onBack={onBack}
      actions={
        phase === "results" ? (
          <RecommendationToolResultsActions
            isReadOnly={isReadOnly}
            isEditDisabled={isCalculating}
            onEdit={handleEdit}
            canCopy={Boolean(sizerOutput)}
            onCopy={handleCopy}
          />
        ) : undefined
      }
    >
      <RecommendationTemplate
        id="architecture"
        preferencesContent={
          <SizingInputForm
            values={formValues}
            onChange={setFormValues}
            showWorkerNode={showWorkerNode}
            showControlPlane={showControlPlane}
            showControlPlaneScheduling={showControlPlaneScheduling}
            showSmt={showSmt}
          />
        }
        resultsContent={
          <SizingResult
            clusterName={clusterName}
            formValues={formValues}
            sizerOutput={sizerOutput}
            isLoading={isCalculating}
            error={calculateError ?? null}
          />
        }
        onGenerate={handleCalculate}
        isLoading={isCalculating}
        isGenerateDisabled={!isFormValid}
        hasResults={Boolean(sizerOutput || isCalculating || calculateError)}
        generateButtonText="Generate recommendation"
        resultsTitle=""
        hasError={Boolean(calculateError)}
        showAlert={!hasUtilizationComparison(sizerOutput)}
        isPreferencesDisabled={isReadOnly}
        initialShowResults={isReadOnly}
        phase={phase}
        onPhaseChange={setPhase}
        hideResultsToolbar
      />
    </RecommendationToolLayout>
  );
};

ArchitectureToolView.displayName = "ArchitectureToolView";

export default ArchitectureToolView;
