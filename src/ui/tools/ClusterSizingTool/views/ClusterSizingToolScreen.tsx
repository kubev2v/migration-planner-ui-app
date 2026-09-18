import { css } from "@emotion/css";
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { RhUiCopyIcon } from "@patternfly/react-icons";
import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  canCopyToClipboard,
  copyToClipboard,
} from "../../../../lib/common/Clipboard";
import { routes } from "../../../../routing/Routes";
import { ToolLayout } from "../../../core/components/ToolLayout";
import { generatePlainTextRecommendation } from "../../../report/view-models/ClusterSizingHelpers";
import { SizingInputForm } from "../../../report/views/cluster-sizer/SizingInputForm";
import { SizingResult } from "../../../report/views/cluster-sizer/SizingResult";
import { useClusterSizingToolViewModel } from "../view-models/useClusterSizingToolViewModel";

const formActionsStyle = css`
  margin-top: var(--pf-t--global--spacer--300);
`;

const resultsHeaderStyle = css`
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const CLUSTER_NAME = "Cluster";

export const ClusterSizingToolScreen: React.FC = () => {
  const navigate = useNavigate();
  const vm = useClusterSizingToolViewModel();
  const showForm = vm.view === "form" || vm.view === "edit";
  const showCancel = vm.view === "edit";

  const handleGenerate = (): void => {
    void vm.calculate().catch((err: unknown) => {
      console.error("Generate recommendation failed:", err);
    });
  };

  const plainTextRecommendation = useMemo(() => {
    if (!vm.sizerOutput) return "";
    return generatePlainTextRecommendation(
      CLUSTER_NAME,
      vm.formValues,
      vm.sizerOutput,
    );
  }, [vm.formValues, vm.sizerOutput]);

  const handleCopyRecommendations = useCallback((): void => {
    if (!canCopyToClipboard()) return;
    copyToClipboard(plainTextRecommendation);
  }, [plainTextRecommendation]);

  return (
    <ToolLayout
      title="Cluster sizing tool"
      description="Generate cluster recommendations based on your infrastructure inputs."
      onBack={() => void navigate(routes.tools)}
      backLabel="Back to all tools"
    >
      <Card>
        <CardBody>
          {showForm ? (
            <>
              <SizingInputForm
                values={vm.formValues}
                onChange={vm.setFormValues}
                showWorkerNode={vm.showWorkerNode}
                showControlPlane={vm.showControlPlane}
                showControlPlaneScheduling={vm.showControlPlaneScheduling}
                showSmt={vm.showSmt}
                showWorkloadInputs
                useStackedLayout
                workloadValues={vm.workloadValues}
                onWorkloadChange={vm.setWorkloadValues}
              />

              <ActionList className={formActionsStyle}>
                <ActionListGroup>
                  <ActionListItem>
                    <Button
                      variant="primary"
                      onClick={handleGenerate}
                      isLoading={vm.isCalculating}
                      isDisabled={vm.isCalculating || !vm.isFormValid}
                    >
                      Generate recommendation
                    </Button>
                  </ActionListItem>
                  {showCancel && (
                    <ActionListItem>
                      <Button
                        variant="secondary"
                        onClick={vm.cancelEdit}
                        isDisabled={vm.isCalculating}
                      >
                        Cancel
                      </Button>
                    </ActionListItem>
                  )}
                </ActionListGroup>
              </ActionList>
            </>
          ) : (
            <>
              <Flex
                className={resultsHeaderStyle}
                justifyContent={{ default: "justifyContentSpaceBetween" }}
                alignItems={{ default: "alignItemsCenter" }}
                flexWrap={{ default: "wrap" }}
                gap={{ default: "gapMd" }}
              >
                <FlexItem></FlexItem>
                <FlexItem>
                  <Flex gap={{ default: "gapMd" }}>
                    {vm.sizerOutput && (
                      <FlexItem>
                        <Button
                          variant="link"
                          icon={<RhUiCopyIcon />}
                          iconPosition="end"
                          onClick={handleCopyRecommendations}
                        >
                          Copy as plain text
                        </Button>
                      </FlexItem>
                    )}
                    <FlexItem>
                      <Button
                        variant="secondary"
                        onClick={vm.startNewRecommendation}
                        isDisabled={vm.isCalculating}
                      >
                        Generate new recommendation
                      </Button>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>

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
                <StackItem>
                  <SizingResult
                    clusterName={CLUSTER_NAME}
                    formValues={vm.formValues}
                    sizerOutput={vm.sizerOutput}
                    isLoading={vm.isCalculating}
                    error={vm.calculateError ?? null}
                  />
                </StackItem>
              </Stack>
            </>
          )}
        </CardBody>
      </Card>
    </ToolLayout>
  );
};

ClusterSizingToolScreen.displayName = "ClusterSizingToolScreen";

export default ClusterSizingToolScreen;
