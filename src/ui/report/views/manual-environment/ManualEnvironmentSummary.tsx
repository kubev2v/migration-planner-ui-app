import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";

import type {
  ManualEnvironmentSummary as ManualEnvironmentSummaryModel,
  SummaryField,
} from "../../manual-environment/types";
import { summaryList } from "./styles";

const DetailFields: React.FC<{ fields: SummaryField[] }> = ({ fields }) => (
  <DescriptionList className={summaryList}>
    {fields.map((item) => (
      <DescriptionListGroup key={item.label}>
        <DescriptionListTerm>{item.label}</DescriptionListTerm>
        <DescriptionListDescription>{item.value}</DescriptionListDescription>
      </DescriptionListGroup>
    ))}
  </DescriptionList>
);

DetailFields.displayName = "DetailFields";

const DetailsCard: React.FC<{
  title: string;
  fields: SummaryField[];
  isFullHeight?: boolean;
}> = ({ title, fields, isFullHeight = false }) => (
  <Card isFullHeight={isFullHeight}>
    <CardTitle component="h3">{title}</CardTitle>
    <CardBody>
      <DetailFields fields={fields} />
    </CardBody>
  </Card>
);

DetailsCard.displayName = "DetailsCard";

interface ManualEnvironmentSummaryProps {
  summary: ManualEnvironmentSummaryModel;
}

export const ManualEnvironmentSummary: React.FC<
  ManualEnvironmentSummaryProps
> = ({ summary }) => (
  <Grid hasGutter>
    <GridItem md={6}>
      <DetailsCard
        title="VMware environment"
        fields={summary.vmware}
        isFullHeight
      />
    </GridItem>
    <GridItem md={6}>
      <Stack hasGutter>
        <StackItem>
          <DetailsCard title="vSphere core" fields={summary.vsphere} />
        </StackItem>
        <StackItem>
          <DetailsCard title="NSX & Aria" fields={summary.nsx} />
        </StackItem>
      </Stack>
    </GridItem>
    <GridItem>
      <DetailsCard title="Customer & target" fields={summary.customer} />
    </GridItem>
  </Grid>
);

ManualEnvironmentSummary.displayName = "ManualEnvironmentSummary";
