import { css } from "@emotion/css";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  type MenuToggleElement,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { AngleLeftIcon, RhUiScaleBalancedIcon } from "@patternfly/react-icons";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../../routing/Routes";
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
    <Stack hasGutter>
      <StackItem>
        <Button
          variant="link"
          isInline
          icon={<AngleLeftIcon />}
          onClick={() => void navigate(routes.tools)}
        >
          Back to all tools
        </Button>
      </StackItem>

      <StackItem>
        <Flex
          alignItems={{ default: "alignItemsFlexStart" }}
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          flexWrap={{ default: "wrap" }}
          gap={{ default: "gapMd" }}
        >
          <FlexItem>
            <Content>
              <Content component={ContentVariants.h1}>Cost estimator</Content>
              <Content component={ContentVariants.p}>
                Compare VMware plans against a Red Hat solution over three
                years. Adjust inputs, then calculate to see results.
              </Content>
            </Content>
          </FlexItem>
          <FlexItem>
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
          </FlexItem>
        </Flex>
      </StackItem>

      <StackItem>
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
                      <Alert
                        variant="danger"
                        isInline
                        title="Calculation failed"
                      >
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
                          Adjust your inputs and click Calculate to see the
                          3-year total cost of ownership (TCO) comparison and
                          savings.
                        </EmptyStateBody>
                      </EmptyState>
                    )}
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};

StandaloneCostEstimationScreen.displayName = "StandaloneCostEstimationScreen";

export default StandaloneCostEstimationScreen;
