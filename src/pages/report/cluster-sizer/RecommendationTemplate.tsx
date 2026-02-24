import {
  Alert,
  Button,
  ExpandableSection,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import React, { ReactNode, useState } from "react";

interface RecommendationTemplateProps {
  /** Title for the preferences section */
  preferencesTitle?: string;
  /** React component or element to render in the preferences section */
  preferencesContent: ReactNode;
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
}

export const RecommendationTemplate: React.FC<RecommendationTemplateProps> = ({
  preferencesTitle = "Migration preferences",
  preferencesContent,
  resultsContent,
  onGenerate,
  isLoading = false,
  hasResults = false,
  generateButtonText = "Generate recommendation",
}) => {
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(true);

  const handleGenerate = () => {
    const result = onGenerate();
    if (result instanceof Promise) {
      void result.then(() => {
        // Collapse preferences after successful generation
        setIsPreferencesExpanded(false);
      });
    } else {
      // Collapse preferences after generation
      setIsPreferencesExpanded(false);
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <div
          style={{
            backgroundColor: "var(--pf-v6-global--BackgroundColor--200)",
            padding: isPreferencesExpanded
              ? "var(--pf-v6-global--spacer--lg)"
              : "var(--pf-v6-global--spacer--md)",
            borderRadius: "var(--pf-v6-global--BorderRadius--lg)",
          }}
        >
          <ExpandableSection
            title={preferencesTitle}
            toggleText={preferencesTitle}
            isExpanded={isPreferencesExpanded}
            onToggle={(_event, expanded) => setIsPreferencesExpanded(expanded)}
            displaySize="lg"
            style={{ backgroundColor: "#E0F0FF" }}
          >
            <Stack
              hasGutter
              style={{ marginTop: "var(--pf-v6-global--spacer--md)" }}
            >
              <StackItem>{preferencesContent}</StackItem>
              <StackItem>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  {generateButtonText}
                </Button>
              </StackItem>
            </Stack>
          </ExpandableSection>
        </div>
      </StackItem>

      {hasResults && (
        <StackItem>
          <Panel>
            <PanelHeader>
              <Title headingLevel="h2">Cluster recommendations</Title>
            </PanelHeader>
            <PanelMain>
              <PanelMainBody>
                <Stack hasGutter>
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
                  <StackItem>{resultsContent}</StackItem>
                </Stack>
              </PanelMainBody>
            </PanelMain>
          </Panel>
        </StackItem>
      )}
    </Stack>
  );
};

RecommendationTemplate.displayName = "RecommendationTemplate";

export default RecommendationTemplate;
