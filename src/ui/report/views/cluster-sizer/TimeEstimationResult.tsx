import { css } from "@emotion/css";
import type { MigrationEstimationResponse } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  List,
  ListItem,
  Spinner,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import { parseDuration } from "./timeUtils";

interface TimeEstimationResultProps {
  clusterName: string;
  estimationOutput: MigrationEstimationResponse | null;
  isLoading: boolean;
  error: Error | null;
}

const sectionStyle = css`
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  padding: var(--pf-t--global--spacer--400);
  margin-bottom: var(--pf-t--global--spacer--400);
`;

const totalTimeStyle = css`
  font-size: var(--pf-t--global--font--size--xl);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const subtitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const phaseHeaderStyle = css`
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-top: var(--pf-t--global--spacer--300);
  margin-bottom: var(--pf-t--global--spacer--200);
`;

interface ParsedAssumption {
  workload?: string;
  resources?: string;
  schedule?: string;
  volume?: string;
  transferSpeed?: string;
}

const parsePostMigrationChecks = (reason: string): ParsedAssumption => {
  const assumptions: ParsedAssumption = {};

  const vmsMatch = reason.match(
    /(\d+)\s+VMs?\s+@\s+([\d.]+)\s+mins?(?:\/|\s+)each/i,
  );
  if (vmsMatch) {
    assumptions.workload = `${vmsMatch[1]} VMs at ${vmsMatch[2]} mins/each`;
  }

  const engineersMatch = reason.match(
    /(\d+)\s+engineers?\s+working\s+(\d+)[-\s]h(?:our)?(?:\/day|\s+shifts?)/i,
  );
  if (engineersMatch) {
    assumptions.resources = `${engineersMatch[1]} Engineers working ${engineersMatch[2]}-hour shifts`;
  }

  const daysMatch = reason.match(/(\d+)\s+(?:work|business)\s+days/i);
  if (daysMatch) {
    assumptions.schedule = `${daysMatch[1]} Business Days total`;
  }

  return assumptions;
};

const parseStorageTransfer = (reason: string): ParsedAssumption => {
  const assumptions: ParsedAssumption = {};

  const volumeMatch = reason.match(/([\d,]+\.?\d*)\s+GB/i);
  if (volumeMatch) {
    const gb = parseFloat(volumeMatch[1].replace(/,/g, ""));
    assumptions.volume = `${gb.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB`;
  }

  const speedMatch = reason.match(/\((\d+)\s+min\/(\d+)GB\)/i);
  if (speedMatch) {
    assumptions.transferSpeed = `~${speedMatch[1]} minutes per ${speedMatch[2]}GB`;
  }

  return assumptions;
};

const getTotalDurationInHours = (duration: string): number => {
  const seconds = parseDuration(duration);
  return Math.round(seconds / 3600);
};

const getTotalDurationInDays = (duration: string): number => {
  const seconds = parseDuration(duration);
  return Math.round(seconds / 86400);
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

  if (!estimationOutput) {
    return null;
  }

  const totalHours = getTotalDurationInHours(estimationOutput.totalDuration);
  const totalDays = getTotalDurationInDays(estimationOutput.totalDuration);

  return (
    <Stack hasGutter>
      <StackItem>
        <div className={sectionStyle}>
          <Title headingLevel="h3">Migration Time Summary</Title>
          <div className={totalTimeStyle}>
            Total Estimated Time: {totalHours} Hours (~{totalDays} Days)
          </div>

          <Table aria-label="Migration time breakdown" variant="compact">
            <Thead>
              <Tr>
                <Th>Phase</Th>
                <Th>Duration</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(estimationOutput.breakdown).map(
                ([phase, detail]) => {
                  const durationHours = getTotalDurationInHours(
                    detail.duration,
                  );
                  const volumeMatch =
                    detail.reason.match(/([\d,]+\.?\d*)\s+GB/i);
                  const vmsMatch = detail.reason.match(/(\d+)\s+VMs?/i);

                  let detailText = "";
                  if (volumeMatch) {
                    const gb = parseFloat(volumeMatch[1].replace(/,/g, ""));
                    const tb = (gb / 1000).toFixed(1);
                    detailText = `${tb} TB Total Volume`;
                  } else if (vmsMatch) {
                    detailText = `${vmsMatch[1]} Virtual Machines`;
                  }

                  return (
                    <Tr key={phase}>
                      <Td>{phase}</Td>
                      <Td>{durationHours} Hours</Td>
                      <Td>{detailText}</Td>
                    </Tr>
                  );
                },
              )}
            </Tbody>
          </Table>
        </div>
      </StackItem>
      <StackItem>
        <div className={sectionStyle}>
          <Title headingLevel="h3">Migration Assumptions</Title>
          <p className={subtitleStyle}>
            The following parameters were used to calculate this estimate:
          </p>

          {Object.entries(estimationOutput.breakdown).map(([phase, detail]) => {
            const isPostMigration = phase
              .toLowerCase()
              .includes("post-migration");
            const assumptions = isPostMigration
              ? parsePostMigrationChecks(detail.reason)
              : parseStorageTransfer(detail.reason);

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
                      <strong>Resources:</strong> {assumptions.resources}
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
                </List>
              </div>
            );
          })}
        </div>
      </StackItem>
    </Stack>
  );
};

TimeEstimationResult.displayName = "TimeEstimationResult";

export default TimeEstimationResult;
