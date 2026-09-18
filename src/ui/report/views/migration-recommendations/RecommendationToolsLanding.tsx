import { css } from "@emotion/css";
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
} from "@patternfly/react-core";
import { AngleRightIcon } from "@patternfly/react-icons";
import React from "react";

import type { RecommendationToolCard, RecommendationToolId } from "./types";

export const toolCardStyle = css`
  height: 100%;
`;

export const disabledToolCardStyle = css`
  height: 100%;
  background-color: var(
    --pf-t--global--background--color--secondary--default
  ) !important;
`;

export interface RecommendationToolsLandingProps {
  tools: RecommendationToolCard[];
  onSelectTool: (toolId: RecommendationToolId) => void;
  areToolsDisabled?: boolean;
}

export const RecommendationToolsLanding: React.FC<
  RecommendationToolsLandingProps
> = ({ tools, onSelectTool, areToolsDisabled = false }) => (
  <Stack hasGutter>
    <StackItem>
      <Content component={ContentVariants.h2}>
        Migration recommendations
      </Content>
      <Content component={ContentVariants.p}>
        Use recommendations tool for additional migration information.
      </Content>
    </StackItem>
    <StackItem>
      <Gallery
        hasGutter
        minWidths={{
          default: "100%",
          lg: "calc(50% - 1em)",
          xl: "calc(33% - 1em)",
          "2xl": "calc(20% - 1em)",
        }}
        maxWidths={{ default: "100%", md: "1fr" }}
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
