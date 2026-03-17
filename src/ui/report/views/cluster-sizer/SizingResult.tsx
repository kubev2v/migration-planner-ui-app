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

import { CPU_OVERCOMMIT_OPTIONS, MEMORY_OVERCOMMIT_OPTIONS } from "./constants";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";

const DISCLAIMER_TEXT =
  "Note: Resource requirements are estimates based on current workloads. Please verify this architecture with your SME team to ensure optimal performance.";

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

/**
 * Format a number with locale-specific thousands separators
 */
const formatNumber = (value: number): string => value.toLocaleString();

/**
 * Format a ratio value
 */
const formatRatio = (value: number): string => value.toFixed(2);

/**
 * Get the CPU over-commit ratio label
 */
const getCpuOvercommitLabel = (ratio: number): string => {
  const option = CPU_OVERCOMMIT_OPTIONS.find((opt) => opt.value === ratio);
  return option?.label || `1:${ratio}`;
};

/**
 * Get the memory over-commit ratio label
 */
const getMemoryOvercommitLabel = (ratio: number): string => {
  const option = MEMORY_OVERCOMMIT_OPTIONS.find((opt) => opt.value === ratio);
  return option?.label || `1:${ratio}`;
};

/**
 * Generate the plain text recommendation for clipboard copy
 */
export const generatePlainTextRecommendation = (
  clusterName: string,
  formValues: SizingFormValues,
  output: ClusterRequirementsResponse,
): string => {
  const isSNO = formValues.clusterMode === "single-node";

  if (isSNO) {
    return `
Cluster: ${clusterName}
Target Platform: Bare Metal
Total Nodes: ${output.clusterSizing.totalNodes}
Node Size: ${formValues.customCpu} CPU / ${formValues.customMemoryGb} GB
VMs to Migrate: ${formatNumber(output.inventoryTotals.totalVMs)} VMs
VM resources (request): ${formatNumber(output.inventoryTotals.totalCPU)} CPU / ${formatNumber(output.inventoryTotals.totalMemory)} GB

${DISCLAIMER_TEXT}
`.trim();
  }

  const cpuOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = output.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = output.resourceConsumption.limits?.memory ?? 0;

  return `
Cluster: ${clusterName}
Total Nodes: ${output.clusterSizing.totalNodes} (${output.clusterSizing.workerNodes} workers + ${output.clusterSizing.controlPlaneNodes} control plane)
Failover Capacity: ${output.clusterSizing.failoverNodes} failover nodes
Node Size: ${formValues.customCpu} CPU / ${formValues.customMemoryGb} GB

Additional info
Target Platform: Bare Metal
OverCommitment: CPU ${getCpuOvercommitLabel(formValues.cpuOvercommitRatio)}, Memory ${getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}
VMs to Migrate: ${formatNumber(output.inventoryTotals.totalVMs)} VMs
- CPU Over-Commit Ratio: ${formatRatio(cpuOverCommitRatio)}
- Memory Over-Commit Ratio: ${formatRatio(memoryOverCommitRatio)}
Resource Breakdown
VM resources (request): ${formatNumber(output.inventoryTotals.totalCPU)} CPU / ${formatNumber(output.inventoryTotals.totalMemory)} GB
With Over-commit (limits): ${formatNumber(cpuLimits)} CPU / ${formatNumber(memoryLimits)} GB
Physical Capacity: ${formatNumber(output.clusterSizing.totalCPU)} CPU / ${formatNumber(output.clusterSizing.totalMemory)} GB

${DISCLAIMER_TEXT}
`.trim();
};

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
              {formValues.customCpu} CPU, {formValues.customMemoryGb} GB memory
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
