import { css } from "@emotion/css";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { AngleLeftIcon, RhUiScaleBalancedIcon } from "@patternfly/react-icons";
import React from "react";
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
