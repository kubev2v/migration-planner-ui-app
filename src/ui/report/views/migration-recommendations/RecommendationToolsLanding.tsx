import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Gallery,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { AngleRightIcon } from "@patternfly/react-icons";
import React from "react";

import {
  disabledToolCardStyle,
  landingDescriptionStyle,
  landingHeaderStyle,
  toolCardStyle,
} from "./styles";
import type { RecommendationToolCard, RecommendationToolId } from "./types";

export interface RecommendationToolsLandingProps {
  tools: RecommendationToolCard[];
  onSelectTool: (toolId: RecommendationToolId) => void;
  areToolsDisabled?: boolean;
}

export const RecommendationToolsLanding: React.FC<
  RecommendationToolsLandingProps
> = ({ tools, onSelectTool, areToolsDisabled = false }) => (
  <Stack>
    <StackItem className={landingHeaderStyle}>
      <Title headingLevel="h2">Migration recommendations</Title>
      <Content
        component={ContentVariants.p}
        className={landingDescriptionStyle}
      >
        Use recommendations tool for additional migration information.
      </Content>
    </StackItem>
    <StackItem>
      <Gallery
        hasGutter
        minWidths={{ default: "280px", md: "300px" }}
        maxWidths={{ default: "100%", md: "420px" }}
      >
        {tools.map((tool) => {
          const isDisabled = tool.isDisabled || areToolsDisabled;
          return (
            <Card
              key={tool.id}
              isFullHeight
              isDisabled={isDisabled}
              className={isDisabled ? disabledToolCardStyle : toolCardStyle}
            >
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
              </CardHeader>
              <CardBody>
                <Content component={ContentVariants.p}>
                  {tool.description}
                </Content>
              </CardBody>
              {!isDisabled && (
                <CardFooter>
                  <Button
                    variant="link"
                    isInline
                    icon={<AngleRightIcon />}
                    iconPosition="end"
                    onClick={() => onSelectTool(tool.id)}
                    aria-label={`Open ${tool.title} tool`}
                  >
                    Open tool
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </Gallery>
    </StackItem>
  </Stack>
);

RecommendationToolsLanding.displayName = "RecommendationToolsLanding";

export default RecommendationToolsLanding;
