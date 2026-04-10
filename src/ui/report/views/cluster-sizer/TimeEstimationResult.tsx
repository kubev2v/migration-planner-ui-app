import { css } from "@emotion/css";
import type {
  EstimationDetail,
  SchemaEstimationResult,
} from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Grid,
  GridItem,
  List,
  ListItem,
  Spinner,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import {
  parsePostMigrationChecks,
  parseStorageOffload,
  parseStorageTransfer,
} from "./timeParsingUtils";
import { parseDuration } from "./timeUtils";

interface TimeEstimationResultProps {
  clusterName: string;
  estimationOutput: Record<string, SchemaEstimationResult> | null;
  isLoading: boolean;
  error: Error | null;
}

const sectionStyle = css`
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  padding: var(--pf-t--global--spacer--400);
  height: 100%;
`;

const equalHeightGridStyle = css`
  align-items: stretch;
`;

const totalTimeStyle = css`
  font-size: var(--pf-t--global--font--size--xl);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const schemaTitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--200);
`;

const assumptionsSubtitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const phaseHeaderStyle = css`
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-top: var(--pf-t--global--spacer--300);
  margin-bottom: var(--pf-t--global--spacer--200);
`;

const SCHEMA_DISPLAY: Record<
  string,
  { summaryTitle: string; summarySubtitle: string; assumptionsTitle: string }
> = {
  "network-based": {
    summaryTitle: "Migration Time Summary",
    summarySubtitle: "Network-based Estimation",
    assumptionsTitle: "Migration Assumptions",
  },
  "storage-offload": {
    summaryTitle: "Storage-offload Estimation",
    summarySubtitle: "Storage-offload Estimation",
    assumptionsTitle: "Storage-offload Assumptions",
  },
};

const getSchemaDisplay = (schemaName: string) =>
  SCHEMA_DISPLAY[schemaName] ?? {
    summaryTitle: schemaName,
    summarySubtitle: schemaName,
    assumptionsTitle: `${schemaName} Assumptions`,
  };

const durationToHours = (duration: string): number =>
  Math.ceil(parseDuration(duration) / 3600);

const formatTotalTime = (result: SchemaEstimationResult): string => {
  const minH = durationToHours(result.minTotalDuration);
  const maxH = durationToHours(result.maxTotalDuration);
  if (minH === maxH) return `${minH} Hours`;
  return `${minH} \u2013 ${maxH} Hours`;
};

const formatDetailDuration = (detail: EstimationDetail): string => {
  if (detail.duration) {
    return `${durationToHours(detail.duration)} Hours`;
  }
  if (detail.minDuration && detail.maxDuration) {
    const minH = durationToHours(detail.minDuration);
    const maxH = durationToHours(detail.maxDuration);
    if (minH === maxH) return `${minH} Hours`;
    return `${minH} \u2013 ${maxH} Hours`;
  }
  return "N/A";
};

const extractDetailText = (reason: string): string => {
  const volumeMatch = reason.match(/([\d,]+\.?\d*)\s+GB(?!\/)/i);
  const vmsMatch = reason.match(/(\d+)\s+VMs?/i);
  if (volumeMatch) {
    const gb = parseFloat(volumeMatch[1].replace(/,/g, ""));
    return `${(gb / 1000).toFixed(1)} TB Total Volume`;
  }
  if (vmsMatch) {
    return `${vmsMatch[1]} Virtual Machines`;
  }
  return "";
};

const getAssumptions = (schemaName: string, phase: string, reason: string) => {
  if (phase.toLowerCase().includes("post-migration")) {
    return parsePostMigrationChecks(reason);
  }
  if (schemaName === "storage-offload") {
    return parseStorageOffload(reason);
  }
  return parseStorageTransfer(reason);
};

export const TimeEstimationResult: React.FC<TimeEstimationResultProps> = ({
  clusterName,
  estimationOutput,
  isLoading,
  error,
}) => {
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

  if (!estimationOutput || Object.keys(estimationOutput).length === 0) {
    return null;
  }

  const schemas = Object.entries(estimationOutput);

  const gridSpan = schemas.length > 1 ? 6 : 12;

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter className={equalHeightGridStyle}>
          {schemas.map(([schemaName, result]) => {
            const display = getSchemaDisplay(schemaName);
            const breakdownEntries = result.breakdown
              ? Object.entries(result.breakdown)
              : [];

            return (
              <GridItem key={schemaName} span={gridSpan}>
                <div className={sectionStyle}>
                  <Title headingLevel="h3">{display.summaryTitle}</Title>
                  <div className={schemaTitleStyle}>
                    {display.summarySubtitle}
                  </div>
                  <div className={totalTimeStyle}>
                    Total Estimated Time: {formatTotalTime(result)}
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
      </StackItem>

      <StackItem>
        <Grid hasGutter className={equalHeightGridStyle}>
          {schemas.map(([schemaName, result]) => {
            const display = getSchemaDisplay(schemaName);
            const breakdownEntries = result.breakdown
              ? Object.entries(result.breakdown)
              : [];

            return (
              <GridItem key={schemaName} span={gridSpan}>
                <div className={sectionStyle}>
                  <Title headingLevel="h3">{display.assumptionsTitle}</Title>
                  <p className={assumptionsSubtitleStyle}>
                    The following parameters were used to calculate these
                    estimates:
                  </p>

                  {breakdownEntries.map(([phase, detail]) => {
                    const assumptions = getAssumptions(
                      schemaName,
                      phase,
                      detail.reason,
                    );
                    return (
                      <div key={phase}>
                        <div className={phaseHeaderStyle}>{phase}</div>
                        <List>
                          {assumptions.workload && (
                            <ListItem>
                              <strong>Workload:</strong> {assumptions.workload}
                            </ListItem>
                          )}
                          {assumptions.resources && (
                            <ListItem>
                              <strong>Resources:</strong>{" "}
                              {assumptions.resources}
                            </ListItem>
                          )}
                          {assumptions.schedule && (
                            <ListItem>
                              <strong>Schedule:</strong> {assumptions.schedule}
                            </ListItem>
                          )}
                          {assumptions.volume && (
                            <ListItem>
                              <strong>Volume:</strong> {assumptions.volume}
                            </ListItem>
                          )}
                          {assumptions.transferSpeed && (
                            <ListItem>
                              <strong>Transfer Speed:</strong>{" "}
                              {assumptions.transferSpeed}
                            </ListItem>
                          )}
                          {assumptions.transferRate && (
                            <ListItem>
                              <strong>Transfer Rate:</strong>{" "}
                              {assumptions.transferRate}
                            </ListItem>
                          )}
                          {assumptions.assumption && (
                            <ListItem>
                              <strong>Assumption:</strong>{" "}
                              {assumptions.assumption}
                            </ListItem>
                          )}
                        </List>
                      </div>
                    );
                  })}
                </div>
              </GridItem>
            );
          })}
        </Grid>
      </StackItem>
    </Stack>
  );
};

TimeEstimationResult.displayName = "TimeEstimationResult";

export default TimeEstimationResult;
