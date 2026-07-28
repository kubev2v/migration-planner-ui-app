import { css } from "@emotion/css";
import {
  Alert,
  ExpandableSection,
  Flex,
  Stack,
  StackItem,
  TabContent,
  TabContentBody,
} from "@patternfly/react-core";
import React, { useState } from "react";

import type {
  CostEstimationFormValues,
  CostEstimationResponse,
} from "../../../../../models/CostEstimationModel";
import CostEstimationCopyAsTextButton from "./CostEstimationCopyAsTextButton";
import CostEstimationForm from "./CostEstimationForm";
import CostEstimationResult, {
  CostEstimationResultSkeleton,
} from "./CostEstimationResult";

interface CostEstimationTabContentProps {
  isLoading?: boolean;
  errorMessage: Error | undefined;
  costEstimation: CostEstimationResponse | null;
  calculateCostEstimation: (
    costEstimationData: CostEstimationFormValues,
  ) => Promise<void>;
}

const expandableSectionStyle = css`
  background-color: var(
    --pf-t--global--background--color--status--info--default
  ) !important;
`;

export const CostEstimationTabContent: React.FC<
  CostEstimationTabContentProps
> = ({
  isLoading = false,
  errorMessage,
  costEstimation,
  calculateCostEstimation,
}) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);

  return (
    <TabContent id="cost-estimation">
      <TabContentBody>
        <Stack hasGutter>
          <StackItem>
            <ExpandableSection
              title="Cost estimation"
              toggleText="Cost estimation"
              isExpanded={isSectionExpanded}
              onToggle={(_event, expanded) => setIsSectionExpanded(expanded)}
              displaySize="lg"
              className={expandableSectionStyle}
            >
              <CostEstimationForm
                isLoading={isLoading}
                onSubmit={(data) => {
                  setIsSectionExpanded(false);
                  void calculateCostEstimation(data);
                }}
              />
            </ExpandableSection>
          </StackItem>
          {errorMessage && (
            <Alert isInline variant="danger" title="Cost estimation error">
              {errorMessage.message}
            </Alert>
          )}
          {isLoading ? (
            <StackItem>
              <CostEstimationResultSkeleton />
            </StackItem>
          ) : (
            costEstimation !== null && (
              <StackItem>
                <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
                  <CostEstimationCopyAsTextButton
                    costEstimation={costEstimation}
                  />
                </Flex>
                <CostEstimationResult costEstimation={costEstimation} />
              </StackItem>
            )
          )}
        </Stack>
      </TabContentBody>
    </TabContent>
  );
};

CostEstimationTabContent.displayName = "CostEstimationTabContent";

export default CostEstimationTabContent;
