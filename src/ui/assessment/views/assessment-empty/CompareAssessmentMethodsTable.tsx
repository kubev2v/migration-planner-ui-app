import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import React from "react";
import { Link } from "react-router-dom";

import { routes } from "../../../../routing/Routes";

const methods = [
  {
    id: "discovery-ova-comparison",
    title: "Discovery OVA (recommended)",
    details: [
      { label: "Time to first assessment", value: "~10 mins (spin up VM)" },
      { label: "Data sharing", value: "Optional, but recommended" },
      {
        label: "Depth of analysis",
        value: "Deep (per-VM analysis, and advanced tooling)",
      },
      {
        label: "Storage calculation",
        value: "Based on real utilization metrics",
      },
      {
        label: "Dependency mapping",
        value: "Mapped (network and VM dependencies)",
      },
    ],
    sampleLink: {
      getTo: () => routes.discoveryOvaExampleReport,
      label: "See OVA report",
    },
  },
  {
    id: "rvtools-comparison",
    title: "RVTools file",
    details: [
      { label: "Time to first assessment", value: "< 5 mins (upload file)" },
      { label: "Data sharing", value: "Required" },
      {
        label: "Depth of analysis",
        value: "High-level (aggregated data, manual blocker review)",
      },
      {
        label: "Storage calculation",
        value: "Based on estimated metrics",
      },
      { label: "Dependency mapping", value: "Not captured" },
    ],
    sampleLink: {
      getTo: () => routes.exampleReport,
      label: "See RVTools report",
    },
  },
];

export const CompareAssessmentMethodsTable: React.FC = () => (
  <Stack hasGutter>
    <StackItem>
      <Flex justifyContent={{ default: "justifyContentCenter" }}>
        <Title
          id="discovery-method-comparison-heading"
          headingLevel="h3"
          size="md"
        >
          Compare assessment methods
        </Title>
      </Flex>
    </StackItem>
    <StackItem>
      <Grid hasGutter role="group" aria-label="Discovery method comparison">
        {methods.map(({ id, title, details, sampleLink }) => {
          const sampleLinkButtonProps = {
            component: Link,
            to: sampleLink.getTo(),
            variant: "link" as const,
            isInline: true,
          };

          return (
            <GridItem key={id} md={6}>
              <Card isFullHeight>
                <CardHeader>
                  <CardTitle component="h4">{title}</CardTitle>
                </CardHeader>
                <CardBody>
                  <DescriptionList isHorizontal>
                    {details.map(({ label, value }) => (
                      <DescriptionListGroup key={label}>
                        <DescriptionListTerm>{label}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {value}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    ))}
                    <DescriptionListGroup>
                      <DescriptionListTerm>Sample assessment</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Button {...sampleLinkButtonProps}>
                          {sampleLink.label}
                        </Button>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </Grid>
    </StackItem>
  </Stack>
);

CompareAssessmentMethodsTable.displayName = "CompareAssessmentMethodsTable";
