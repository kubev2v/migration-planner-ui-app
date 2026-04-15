import { css } from "@emotion/css";
import type {
  EstimationDetail,
  MigrationEstimationResponse,
  SchemaEstimationResult,
} from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  List,
  ListItem,
  Spinner,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useCallback, useMemo } from "react";

import PopoverIcon from "./PopoverIcon";
import {
  type ParsedAssumption,
  parsePostMigrationChecks,
  parseStorageOffload,
  parseStorageTransfer,
} from "./timeParsingUtils";
import { durationToHours, formatHumanDuration } from "./timeUtils";

interface TimeEstimationResultProps {
  clusterName: string;
  estimationOutput: MigrationEstimationResponse | null;
  isLoading: boolean;
  error: Error | null;
}

const cardStyle = css`
  background-color: var(--pf-t--global--background--color--secondary--default);
  border-radius: var(--pf-t--global--border--radius--medium);
  padding: var(--pf-t--global--spacer--400);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const outerCardStyle = css`
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--medium);
  padding: var(--pf-t--global--spacer--400);
`;

const cardHeaderStyle = css`
  margin-bottom: var(--pf-t--global--spacer--400);
`;

const equalHeightGridStyle = css`
  align-items: stretch;
`;

const schemaTitleStyle = css`
  display: flex;
  align-items: center;
  gap: var(--pf-t--global--spacer--100);
  color: var(--pf-t--global--text--color--subtle);
  font-size: var(--pf-t--global--font--size--sm);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-bottom: var(--pf-t--global--spacer--200);
  justify-content: center;
`;

const totalTimeStyle = css`
  font-size: var(--pf-t--global--font--size--2xl);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  text-align: center;
  margin-bottom: var(--pf-t--global--spacer--100);
`;

const hoursSubtitleStyle = css`
  font-size: var(--pf-t--global--font--size--sm);
  color: var(--pf-t--global--text--color--subtle);
  text-align: center;
  margin-bottom: var(--pf-t--global--spacer--400);
`;

const popoverPhaseTitle = css`
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-top: var(--pf-t--global--spacer--200);
  margin-bottom: var(--pf-t--global--spacer--100);
`;

const SCHEMA_LABELS: Record<string, string> = {
  "network-based": "Network-based estimation",
  "storage-offload": "Storage-offload estimation",
};

const getSchemaLabel = (schemaName: string): string =>
  SCHEMA_LABELS[schemaName] ?? schemaName;

const formatTotalDisplay = (result: SchemaEstimationResult): string => {
  const minH = durationToHours(result.minTotalDuration);
  const maxH = durationToHours(result.maxTotalDuration);
  if (minH === maxH) return formatHumanDuration(minH);
  return `${formatHumanDuration(minH)}\u2013${formatHumanDuration(maxH)}`;
};

const formatHoursSubtitle = (result: SchemaEstimationResult): string => {
  const minH = durationToHours(result.minTotalDuration);
  const maxH = durationToHours(result.maxTotalDuration);
  const fmt = (h: number) => h.toLocaleString("en-US");
  if (minH === maxH) {
    return `${fmt(minH)} ${minH === 1 ? "hour" : "hours"}`;
  }
  return `${fmt(minH)}\u2013${fmt(maxH)} hours`;
};

const formatDetailDuration = (detail: EstimationDetail): string => {
  if (detail.duration) {
    const h = durationToHours(detail.duration);
    return `${h.toLocaleString("en-US")} ${h === 1 ? "hour" : "hours"}`;
  }
  if (detail.minDuration && detail.maxDuration) {
    const minH = durationToHours(detail.minDuration);
    const maxH = durationToHours(detail.maxDuration);
    if (minH === maxH) {
      return `${minH.toLocaleString("en-US")} ${minH === 1 ? "hour" : "hours"}`;
    }
    return `${minH.toLocaleString("en-US")}\u2013${maxH.toLocaleString("en-US")} hours`;
  }
  return "N/A";
};

const extractDetailText = (reason: string): string => {
  const volumeMatch = reason.match(/([\d,]+\.?\d*)\s+GB(?!\/)/i);
  const vmsMatch = reason.match(/(\d+)\s+VMs?/i);
  if (volumeMatch) {
    const gb = parseFloat(volumeMatch[1].replace(/,/g, ""));
    return `${(gb / 1000).toFixed(1)} TB total volume`;
  }
  if (vmsMatch) {
    return `${Number(vmsMatch[1]).toLocaleString("en-US")} VMs`;
  }
  return "";
};

const getAssumptions = (
  schemaName: string,
  phase: string,
  reason: string,
): ParsedAssumption => {
  if (phase.toLowerCase().includes("post-migration")) {
    return parsePostMigrationChecks(reason);
  }
  if (schemaName === "storage-offload") {
    return parseStorageOffload(reason);
  }
  return parseStorageTransfer(reason);
};

const renderAssumptionItems = (assumptions: ParsedAssumption) => {
  const entries: [string, string | undefined][] = [
    ["Workload", assumptions.workload],
    ["Resources", assumptions.resources],
    ["Schedule", assumptions.schedule],
    ["Volume", assumptions.volume],
    ["Transfer Speed", assumptions.transferSpeed],
    ["Transfer Rate", assumptions.transferRate],
    ["Assumption", assumptions.assumption],
  ];

  return entries
    .filter(([, value]) => value)
    .map(([label, value]) => (
      <ListItem key={label}>
        {label}: {value}
      </ListItem>
    ));
};

const buildPopoverBody = (
  schemaName: string,
  breakdownEntries: [string, EstimationDetail][],
): React.ReactNode => (
  <div>
    {breakdownEntries.map(([phase, detail]) => {
      const assumptions = getAssumptions(schemaName, phase, detail.reason);
      const items = renderAssumptionItems(assumptions);
      if (items.length === 0) return null;
      return (
        <div key={phase}>
          <div className={popoverPhaseTitle}>{phase}</div>
          <List>{items}</List>
        </div>
      );
    })}
  </div>
);

const generatePlainText = (output: MigrationEstimationResponse): string => {
  const lines: string[] = ["Migration time estimation", ""];

  for (const [schemaName, result] of Object.entries(output.estimation)) {
    lines.push(getSchemaLabel(schemaName));
    lines.push(
      `  Total: ${formatTotalDisplay(result)} (${formatHoursSubtitle(result)})`,
    );

    if (result.breakdown) {
      for (const [phase, detail] of Object.entries(result.breakdown)) {
        const dur = formatDetailDuration(detail);
        const text = extractDetailText(detail.reason);
        lines.push(`  ${phase}: ${dur}${text ? ` - ${text}` : ""}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
};

export const TimeEstimationResult: React.FC<TimeEstimationResultProps> = ({
  clusterName,
  estimationOutput,
  isLoading,
  error,
}) => {
  const canCopy = useMemo(
    () =>
      !!estimationOutput &&
      typeof navigator.clipboard?.writeText === "function" &&
      (typeof window === "undefined" || window.isSecureContext),
    [estimationOutput],
  );

  const handleCopy = useCallback(() => {
    if (!canCopy || !estimationOutput) {
      return;
    }
    navigator.clipboard
      .writeText(generatePlainText(estimationOutput))
      .catch((err: unknown) => {
        console.error("Failed to copy estimation to clipboard", err);
      });
  }, [canCopy, estimationOutput]);

  if (isLoading) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Spinner
            size="lg"
            aria-label="Calculating migration time estimation"
          />
        </StackItem>
        <StackItem>
          <p>Calculating migration time estimation for {clusterName}...</p>
        </StackItem>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" isInline title="Calculation failed">
        {error.message}
      </Alert>
    );
  }

  if (
    !estimationOutput ||
    Object.keys(estimationOutput.estimation).length === 0
  ) {
    return null;
  }

  const schemas = Object.entries(estimationOutput.estimation);
  const gridSpan = schemas.length > 1 ? 6 : 12;

  return (
    <div className={outerCardStyle}>
      <Flex
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignItems={{ default: "alignItemsCenter" }}
        className={cardHeaderStyle}
      >
        <FlexItem>
          <Title headingLevel="h3">Migration time estimation</Title>
        </FlexItem>
        <FlexItem>
          <Button
            variant="link"
            icon={<CopyIcon />}
            iconPosition="end"
            onClick={handleCopy}
            isDisabled={!canCopy}
          >
            Copy as plain text
          </Button>
        </FlexItem>
      </Flex>
      <Grid hasGutter className={equalHeightGridStyle}>
        {schemas.map(([schemaName, result]) => {
          const breakdownEntries: [string, EstimationDetail][] =
            result.breakdown ? Object.entries(result.breakdown) : [];

          return (
            <GridItem key={schemaName} span={gridSpan}>
              <div className={cardStyle}>
                <div className={schemaTitleStyle}>
                  <span>{getSchemaLabel(schemaName)}</span>
                  <PopoverIcon
                    noVerticalAlign
                    headerContent={getSchemaLabel(schemaName)}
                    bodyContent={
                      <div>
                        <p>Estimates are based on the following parameters:</p>
                        {buildPopoverBody(schemaName, breakdownEntries)}
                      </div>
                    }
                  />
                </div>

                <Title headingLevel="h2" className={totalTimeStyle}>
                  {formatTotalDisplay(result)}
                </Title>

                <div className={hoursSubtitleStyle}>
                  {formatHoursSubtitle(result)}
                </div>

                <Table
                  aria-label={`${schemaName} time breakdown`}
                  variant="compact"
                >
                  <Thead>
                    <Tr>
                      <Th>Phase</Th>
                      <Th>Duration</Th>
                      <Th>Details</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {breakdownEntries.map(([phase, detail]) => (
                      <Tr key={phase}>
                        <Td>{phase}</Td>
                        <Td>{formatDetailDuration(detail)}</Td>
                        <Td>{extractDetailText(detail.reason)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            </GridItem>
          );
        })}
      </Grid>
    </div>
  );
};

TimeEstimationResult.displayName = "TimeEstimationResult";

export default TimeEstimationResult;
