import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Gallery,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";

import { useToolsScreenViewModel } from "../view-models/useToolsScreenViewModel";

export const ToolsScreen: React.FC = () => {
  const { isPartner, navigateToClusterSizing, navigateToCostEstimation } =
    useToolsScreenViewModel();

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component={ContentVariants.h1}>Tools</Content>
        <Content component={ContentVariants.p}>
          Standalone utilities that do not require an assessment.
        </Content>
      </StackItem>
      <StackItem>
        <Gallery
          hasGutter
          minWidths={{ default: "280px", md: "320px" }}
          maxWidths={{ default: "100%", md: "480px" }}
        >
          <Card isFullHeight>
            <CardHeader>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                justifyContent={{ default: "justifyContentSpaceBetween" }}
                flexWrap={{ default: "nowrap" }}
                gap={{ default: "gapSm" }}
              >
                <FlexItem>
                  <CardTitle>Cluster sizing</CardTitle>
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody>
              <Content component={ContentVariants.p}>
                Estimate OpenShift capacity from workload and architecture
                inputs.
              </Content>
            </CardBody>
            <CardFooter>
              <Button
                variant="primary"
                aria-label="Open cluster sizing tool"
                onClick={navigateToClusterSizing}
              >
                Open tool
              </Button>
            </CardFooter>
          </Card>

          {isPartner && (
            <Card isFullHeight>
              <CardHeader>
                <Flex
                  alignItems={{ default: "alignItemsCenter" }}
                  justifyContent={{ default: "justifyContentSpaceBetween" }}
                  flexWrap={{ default: "nowrap" }}
                  gap={{ default: "gapSm" }}
                >
                  <FlexItem>
                    <CardTitle>Cost estimator</CardTitle>
                  </FlexItem>
                  <FlexItem>
                    <Label color="blue">Partners</Label>
                  </FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                <Content component={ContentVariants.p}>
                  Compare VMware plans against a Red Hat solution over three
                  years (TCO).
                </Content>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  aria-label="Open cost estimator tool"
                  onClick={navigateToCostEstimation}
                >
                  Open tool
                </Button>
              </CardFooter>
            </Card>
          )}
        </Gallery>
      </StackItem>
    </Stack>
  );
};

ToolsScreen.displayName = "ToolsScreen";

export default ToolsScreen;
