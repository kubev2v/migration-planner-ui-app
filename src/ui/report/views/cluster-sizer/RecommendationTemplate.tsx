import { Alert, Button, Stack, StackItem } from "@patternfly/react-core";
import type { ReactNode } from "react";
import React, { useState } from "react";

export type RecommendationPhase = "form" | "results";

interface RecommendationTemplateProps {
  id: string;
  preferencesContent?: ReactNode;
  resultsContent: ReactNode;
  onGenerate: () => void | Promise<void>;
  isLoading?: boolean;
  generateButtonText?: string;
  showAlert?: boolean;
  isPreferencesDisabled?: boolean;
  isGenerateDisabled?: boolean;
  /**
   * When true, start on the results view (used by the example report's
   * pre-populated, read-only tools when phase is uncontrolled).
   */
  initialShowResults?: boolean;
  /** Controlled form/results phase. When set, the parent owns the phase. */
  phase?: RecommendationPhase;
  onPhaseChange?: (phase: RecommendationPhase) => void;
}

export const RecommendationTemplate: React.FC<RecommendationTemplateProps> = ({
  id,
  preferencesContent,
  resultsContent,
  onGenerate,
  isLoading = false,
  generateButtonText = "Generate recommendation",
  showAlert = true,
  isPreferencesDisabled = false,
  isGenerateDisabled = false,
  initialShowResults = false,
  phase: phaseProp,
  onPhaseChange,
}) => {
  const isControlled = phaseProp !== undefined;
  const [internalPhase, setInternalPhase] = useState<"form" | "results">(() =>
    initialShowResults ? "results" : "form",
  );
  const phase = isControlled ? phaseProp : internalPhase;

  const setPhase = (next: RecommendationPhase): void => {
    if (!isControlled) {
      setInternalPhase(next);
    }
    onPhaseChange?.(next);
  };

  const handleGenerate = (): void => {
    setPhase("results");
    const result = onGenerate();
    if (result instanceof Promise) {
      void result.catch((err: unknown) => {
        console.error("Generate recommendation failed:", err);
      });
    }
  };

  return (
    <div id={id}>
      {phase === "form" ? (
        <Stack hasGutter>
          {preferencesContent ? (
            <StackItem>{preferencesContent}</StackItem>
          ) : null}
          <StackItem>
            <Button
              variant="primary"
              onClick={handleGenerate}
              isLoading={isLoading}
              isDisabled={
                isLoading || isPreferencesDisabled || isGenerateDisabled
              }
            >
              {generateButtonText}
            </Button>
          </StackItem>
        </Stack>
      ) : (
        <Stack hasGutter>
          {showAlert ? (
            <StackItem>
              <Alert
                variant="info"
                isInline
                title="Resource requirements are estimates based on current workloads"
              >
                Confirm this architecture with your team to ensure optimal
                performance.
              </Alert>
            </StackItem>
          ) : null}
          <StackItem>{resultsContent}</StackItem>
        </Stack>
      )}
    </div>
  );
};

RecommendationTemplate.displayName = "RecommendationTemplate";

export default RecommendationTemplate;
