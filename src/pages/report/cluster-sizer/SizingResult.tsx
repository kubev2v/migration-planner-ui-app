import {
  Alert,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React, { useCallback, useMemo } from "react";

import { CPU_OVERCOMMIT_OPTIONS, MEMORY_OVERCOMMIT_OPTIONS } from "./constants";
import type { ClusterRequirementsResponse, SizingFormValues } from "./types";

const DISCLAIMER_TEXT =
  "Confirm this architecture with your team to ensure optimal performance.";

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
const generatePlainTextRecommendation = (
  clusterName: string,
  formValues: SizingFormValues,
  output: ClusterRequirementsResponse,
): string => {
  const cpuOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    output.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = output.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = output.resourceConsumption.limits?.memory ?? 0;

  return `
Cluster: ${clusterName}
Total Nodes: ${output.clusterSizing.totalNodes} (${output.clusterSizing.workerNodes} workers + ${output.clusterSizing.controlPlaneNodes} control plane)
Node Size: ${formValues.customCpu} CPU / ${formValues.customMemoryGb} GB

Additional info
Target Platform: BareMetal
Over-Commitment: CPU ${getCpuOvercommitLabel(formValues.cpuOvercommitRatio)}, Memory ${getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}
VMs to Migrate: ${formatNumber(output.inventoryTotals.totalVMs)} VMs
- CPU Over-Commit Ratio: ${formatRatio(cpuOverCommitRatio)}
- Memory Over-Commit Ratio: ${formatRatio(memoryOverCommitRatio)}
Resource Breakdown
VM Resources (requested): ${formatNumber(output.inventoryTotals.totalCPU)} CPU / ${formatNumber(output.inventoryTotals.totalMemory)} GB
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
  const plainTextRecommendation = useMemo(() => {
    if (!sizerOutput) return "";
    return generatePlainTextRecommendation(
      clusterName,
      formValues,
      sizerOutput,
    );
  }, [clusterName, formValues, sizerOutput]);

  const handleCopyRecommendations = useCallback(() => {
    void navigator.clipboard.writeText(plainTextRecommendation).catch((err) => {
      console.error("Failed to copy recommendations:", err);
    });
  }, [plainTextRecommendation]);

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
          <Content>
            <Content component="p">No sizing data available.</Content>
          </Content>
        </StackItem>
      </Stack>
    );
  }

  // Extract optional fields with defaults
  const cpuOverCommitRatio =
    sizerOutput.resourceConsumption.overCommitRatio?.cpu ?? 0;
  const memoryOverCommitRatio =
    sizerOutput.resourceConsumption.overCommitRatio?.memory ?? 0;
  const cpuLimits = sizerOutput.resourceConsumption.limits?.cpu ?? 0;
  const memoryLimits = sizerOutput.resourceConsumption.limits?.memory ?? 0;

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Cluster name</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterName}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Target platform</DescriptionListTerm>
            <DescriptionListDescription>Bare Metal</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Total nodes</DescriptionListTerm>
            <DescriptionListDescription>
              {sizerOutput.clusterSizing.totalNodes} (
              {sizerOutput.clusterSizing.workerNodes} workers +{" "}
              {sizerOutput.clusterSizing.controlPlaneNodes} control plane)
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Node size</DescriptionListTerm>
            <DescriptionListDescription>
              {formValues.customCpu} CPU, {formValues.customMemoryGb} GB memory
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Over-commitment</DescriptionListTerm>
            <DescriptionListDescription>
              {getMemoryOvercommitLabel(formValues.memoryOvercommitRatio)}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Workload details</DescriptionListTerm>
            <DescriptionListDescription>
              <Content>
                • VMs to migrate:{" "}
                {formatNumber(sizerOutput.inventoryTotals.totalVMs)}
              </Content>
              <Content>
                • CPU over-commit ratio: {formatRatio(cpuOverCommitRatio)}
              </Content>
              <Content>
                • Memory over-commit ratio: {formatRatio(memoryOverCommitRatio)}
              </Content>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Resources</DescriptionListTerm>
            <DescriptionListDescription>
              <Content>
                • VM resources (request):{" "}
                {formatNumber(sizerOutput.inventoryTotals.totalCPU)} CPU,{" "}
                {formatNumber(sizerOutput.inventoryTotals.totalMemory)} GB
                memory
              </Content>
              <Content>
                • With Over-commit (limits): {formatNumber(cpuLimits)} CPU,{" "}
                {formatNumber(memoryLimits)} GB memory
              </Content>
              <Content>
                • Physical capacity:{" "}
                {formatNumber(sizerOutput.clusterSizing.totalCPU)} CPU,{" "}
                {formatNumber(sizerOutput.clusterSizing.totalMemory)} GB memory
              </Content>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

SizingResult.displayName = "SizingResult";

export default SizingResult;
