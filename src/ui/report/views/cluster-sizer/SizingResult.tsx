import { css } from "@emotion/css";
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  List,
  ListItem,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";

import {
  formatNumber,
  formatRatio,
  getCpuOvercommitLabel,
  getMemoryOvercommitLabel,
} from "../../view-models/ClusterSizingHelpers";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";

const descriptionListStyles = css`
  .pf-v6-c-description-list__term {
    min-width: 250px;
    width: auto;
  }
`;

interface SizingResultProps {
  clusterName: string;
  formValues: SizingFormValues;
  sizerOutput: ClusterRequirementsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

export const SizingResult: React.FC<SizingResultProps> = ({
  clusterName,
  formValues,
  sizerOutput,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            justifyContent={{ default: "justifyContentCenter" }}
            style={{ minHeight: "200px" }}
          >
            <FlexItem>
              <Spinner size="lg" aria-label="Loading recommendations" />
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    );
  }

  if (error) {
    const title = "Failed to calculate sizing recommendation";
    let message = error.message;
    if (error.cause && typeof error.cause === "string") {
      try {
        const parsedCause = JSON.parse(error.cause) as { message: string };
        const m = parsedCause.message;
        const firstChar = m.charAt(0);
        message = firstChar ? firstChar.toUpperCase() + m.slice(1) : m;
      } catch {
        // Fall back to original message without crashing
      }
    }

    return (
      <Stack hasGutter>
        <StackItem>
          <Alert isInline variant="danger" title={title}>
            {message}
          </Alert>
        </StackItem>
      </Stack>
    );
  }

  if (!sizerOutput) {
    return (
      <Stack hasGutter>
        <StackItem>
          <p>No sizing data available.</p>
        </StackItem>
      </Stack>
    );
  }

  const isSNO = formValues.clusterMode === "single-node";
  const hasControlPlane = sizerOutput.clusterSizing.controlPlaneNodes > 0;

  // Extract optional fields with defaults (only needed for non-SNO modes)
  const cpuOverCommitRatio =
    sizerOutput.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    sizerOutput.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = sizerOutput.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = sizerOutput.resourceConsumption.limits?.memory ?? 0;

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList
          isHorizontal
          isCompact
          className={descriptionListStyles}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Cluster name</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterName}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Target platform</DescriptionListTerm>
            <DescriptionListDescription>Bare metal</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Total nodes</DescriptionListTerm>
            <DescriptionListDescription>
              {isSNO ? (
                sizerOutput.clusterSizing.totalNodes
              ) : (
                <>
                  {sizerOutput.clusterSizing.totalNodes} (
                  {sizerOutput.clusterSizing.workerNodes} workers +{" "}
                  {sizerOutput.clusterSizing.controlPlaneNodes} control plane)
                </>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {!isSNO && (
            <DescriptionListGroup>
              <DescriptionListTerm>Failover Capacity</DescriptionListTerm>
              <DescriptionListDescription>
                {sizerOutput.clusterSizing.failoverNodes} failover nodes
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          <DescriptionListGroup>
            <DescriptionListTerm>Node size</DescriptionListTerm>
            <DescriptionListDescription>
              {isSNO ? (
                `${formValues.controlPlaneCpu} CPU, ${formValues.controlPlaneMemoryGb} GB memory`
              ) : hasControlPlane ? (
                <List isPlain>
                  <ListItem>
                    Worker: {formValues.customCpu} CPU,{" "}
                    {formValues.customMemoryGb} GB memory
                  </ListItem>
                  <ListItem>
                    Control Plane: {formValues.controlPlaneCpu} CPU,{" "}
                    {formValues.controlPlaneMemoryGb} GB memory
                  </ListItem>
                </List>
              ) : (
                `${formValues.customCpu} CPU, ${formValues.customMemoryGb} GB memory`
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {!isSNO && (
            <DescriptionListGroup>
              <DescriptionListTerm>Overcommitment</DescriptionListTerm>
              <DescriptionListDescription>
                CPU {getCpuOvercommitLabel(formValues.cpuOvercommitRatio)},
                Memory{" "}
                {getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          <DescriptionListGroup>
            <DescriptionListTerm>Workload details</DescriptionListTerm>
            <DescriptionListDescription>
              {isSNO ? (
                <>
                  VMs to migrate:{" "}
                  {formatNumber(sizerOutput.inventoryTotals.totalVMs)}
                </>
              ) : (
                <List isPlain>
                  <ListItem>
                    VMs to migrate:{" "}
                    {formatNumber(sizerOutput.inventoryTotals.totalVMs)}
                  </ListItem>
                  <ListItem>
                    CPU over-commit ratio: {formatRatio(cpuOverCommitRatio)}
                  </ListItem>
                  <ListItem>
                    Memory over-commit ratio:{" "}
                    {formatRatio(memoryOverCommitRatio)}
                  </ListItem>
                </List>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Resources</DescriptionListTerm>
            <DescriptionListDescription>
              {isSNO ? (
                <>
                  VM resources (request):{" "}
                  {formatNumber(sizerOutput.inventoryTotals.totalCPU)} CPU,{" "}
                  {formatNumber(sizerOutput.inventoryTotals.totalMemory)} GB
                  memory
                </>
              ) : (
                <List isPlain>
                  <ListItem>
                    VM resources (request):{" "}
                    {formatNumber(sizerOutput.inventoryTotals.totalCPU)} CPU,{" "}
                    {formatNumber(sizerOutput.inventoryTotals.totalMemory)} GB
                    memory
                  </ListItem>
                  <ListItem>
                    With Over-commit (limits): {formatNumber(cpuLimits)} CPU,{" "}
                    {formatNumber(memoryLimits)} GB memory
                  </ListItem>
                  <ListItem>
                    Physical capacity:{" "}
                    {formatNumber(sizerOutput.clusterSizing.totalCPU)} CPU,{" "}
                    {formatNumber(sizerOutput.clusterSizing.totalMemory)} GB
                    memory
                  </ListItem>
                </List>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

SizingResult.displayName = "SizingResult";

export default SizingResult;
