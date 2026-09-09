import { css } from "@emotion/css";
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import type { ReactNode } from "react";
import React, { useState } from "react";

const resultsHeaderStyle = css`
  margin-bottom: var(--pf-t--global--spacer--300);
`;

export type RecommendationPhase = "form" | "results";

interface RecommendationTemplateProps {
  id: string;
  /** React component or element to render in the form */
  preferencesContent?: ReactNode;
  /** React component or element to render in the results section */
  resultsContent: ReactNode;
  /** Function to call when Generate recommendation is clicked */
  onGenerate: () => void | Promise<void>;
  /** Whether the generate operation is currently loading */
  isLoading?: boolean;
  /** Whether results are available to display */
  hasResults?: boolean;
  /** Custom button text (defaults to "Generate recommendation") */
  generateButtonText?: string;
  /** Title for the results section (defaults to "Cluster recommendations") */
  resultsTitle?: string;
  /** Whether to show the info alert in the results section (defaults to true) */
  showAlert?: boolean;
  /** Whether the form is disabled (defaults to false) */
  isPreferencesDisabled?: boolean;
  /** Whether the generate button is disabled due to validation errors */
  isGenerateDisabled?: boolean;
  /** Optional action element rendered inline with the results title */
  headerAction?: ReactNode;
  /** When true, results still show the error so the user can edit and retry */
  hasError?: boolean;
  /** Label for the action that restores the form with previous values */
  editButtonText?: string;
  /**
   * When true, start on the results view if `hasResults` is already true
   * (used by the example report's pre-populated, read-only tools).
   */
  initialShowResults?: boolean;
  /** Controlled form/results phase. When set, the parent owns the phase. */
  phase?: RecommendationPhase;
  onPhaseChange?: (phase: RecommendationPhase) => void;
  /** Hide the built-in results toolbar (title, edit, header actions). */
  hideResultsToolbar?: boolean;
}

export const RecommendationTemplate: React.FC<RecommendationTemplateProps> = ({
  id,
  preferencesContent,
  resultsContent,
  onGenerate,
  isLoading = false,
  hasResults = false,
  generateButtonText = "Generate recommendation",
  resultsTitle = "Cluster recommendations",
  showAlert = true,
  isPreferencesDisabled = false,
  isGenerateDisabled = false,
  headerAction,
  hasError = false,
  editButtonText = "Edit migration preferences",
  initialShowResults = false,
  phase: phaseProp,
  onPhaseChange,
  hideResultsToolbar = false,
}) => {
  const isControlled = phaseProp !== undefined;
  const [internalPhase, setInternalPhase] = useState<"form" | "results">(() =>
    initialShowResults && hasResults ? "results" : "form",
  );
  const phase = isControlled ? phaseProp : internalPhase;

  const setPhase = (next: RecommendationPhase): void => {
    if (!isControlled) {
      setInternalPhase(next);
    }
    onPhaseChange?.(next);
  };

  const showForm = phase === "form";

  const handleGenerate = (): void => {
    setPhase("results");
    const result = onGenerate();
    if (result instanceof Promise) {
      void result.catch((err: unknown) => {
        console.error("Generate recommendation failed:", err);
      });
    }
  };

  const showResultsToolbar =
    !hideResultsToolbar &&
    (Boolean(resultsTitle) ||
      Boolean(headerAction) ||
      (!isPreferencesDisabled && (hasResults || hasError)));

  return (
    <div id={id}>
      {showForm ? (
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
          {showResultsToolbar ? (
            <StackItem>
              <Flex
                className={resultsHeaderStyle}
                justifyContent={{ default: "justifyContentSpaceBetween" }}
                alignItems={{ default: "alignItemsCenter" }}
                flexWrap={{ default: "wrap" }}
                gap={{ default: "gapMd" }}
              >
                <FlexItem>
                  {resultsTitle ? (
                    <Title headingLevel="h2">{resultsTitle}</Title>
                  ) : null}
                </FlexItem>
                <FlexItem>
                  <Flex
                    gap={{ default: "gapMd" }}
                    flexWrap={{ default: "wrap" }}
                  >
                    {headerAction ? <FlexItem>{headerAction}</FlexItem> : null}
                    {!isPreferencesDisabled && (hasResults || hasError) ? (
                      <FlexItem>
                        <Button
                          variant="secondary"
                          onClick={() => setPhase("form")}
                          isDisabled={isLoading}
                        >
                          {editButtonText}
                        </Button>
                      </FlexItem>
                    ) : null}
                  </Flex>
                </FlexItem>
              </Flex>
            </StackItem>
          ) : null}
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
