import { css } from "@emotion/css";
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  Grid,
  GridItem,
  MenuToggle,
  type MenuToggleElement,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { RhUiScaleBalancedIcon } from "@patternfly/react-icons";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../../routing/Routes";
import { ToolLayout } from "../../../core/components/ToolLayout";
import { useStandaloneCostEstimationViewModel } from "../view-models/useStandaloneCostEstimationViewModel";
import StandaloneCostEstimationForm from "./StandaloneCostEstimationForm";
import StandaloneCostEstimationResult from "./StandaloneCostEstimationResult";

const cardStyle = css`
  height: 100%;
`;

export const StandaloneCostEstimationScreen: React.FC = () => {
  const navigate = useNavigate();
  const vm = useStandaloneCostEstimationViewModel();
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <ToolLayout
      title="Cost estimator"
      description="Compare VMware plans against a Red Hat solution over three years. Adjust inputs, then calculate to see results."
      onBack={() => void navigate(routes.tools)}
      backLabel="Back to all tools"
      actions={
        <Dropdown
          isOpen={isExportOpen}
          onOpenChange={setIsExportOpen}
          popperProps={{ position: "end" }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="secondary"
              onClick={() => setIsExportOpen((prev) => !prev)}
              isExpanded={isExportOpen}
              isDisabled={!vm.canExport}
            >
              Export
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            <DropdownItem
              key="copy-text"
              component="button"
              onClick={() => {
                vm.handleCopyAsPlainText();
                setIsExportOpen(false);
              }}
            >
              Copy as plain text
            </DropdownItem>
            <DropdownItem
              key="download-json"
              component="button"
              onClick={() => {
                vm.handleDownloadJson();
                setIsExportOpen(false);
              }}
            >
              Download JSON
            </DropdownItem>
            <DropdownItem
              key="download-txt"
              component="button"
              onClick={() => {
                vm.handleDownloadTxt();
                setIsExportOpen(false);
              }}
            >
              Download TXT
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      }
    >
      <Grid hasGutter>
        <GridItem md={6}>
          <Card isFullHeight className={cardStyle}>
            <CardTitle>
              <Title headingLevel="h2" size="2xl">
                Inputs
              </Title>
            </CardTitle>
            <CardBody>
              <StandaloneCostEstimationForm
                isLoading={vm.isCalculating}
                onSubmit={vm.onSubmit}
              />
            </CardBody>
          </Card>
        </GridItem>

        <GridItem md={6}>
          <Card isFullHeight className={cardStyle}>
            <CardTitle>
              <Title headingLevel="h2" size="2xl">
                Results
              </Title>
            </CardTitle>
            <CardBody>
              <Stack hasGutter>
                {vm.calculateError && (
                  <StackItem>
                    <Alert variant="danger" isInline title="Calculation failed">
                      {vm.calculateError.message}
                    </Alert>
                  </StackItem>
                )}
                <StackItem>
                  {vm.result ? (
                    <StandaloneCostEstimationResult data={vm.result} />
                  ) : (
                    <EmptyState
                      headingLevel="h3"
                      icon={RhUiScaleBalancedIcon}
                      titleText="No results yet"
                    >
                      <EmptyStateBody>
                        Adjust your inputs and click Calculate to see the 3-year
                        total cost of ownership (TCO) comparison and savings.
                      </EmptyStateBody>
                    </EmptyState>
                  )}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </ToolLayout>
  );
};

StandaloneCostEstimationScreen.displayName = "StandaloneCostEstimationScreen";

export default StandaloneCostEstimationScreen;
