import { css } from "@emotion/css";
import type { MigrationComplexityResponse } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Spinner,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

interface ComplexityResultProps {
  clusterName: string;
  complexityOutput: MigrationComplexityResponse | null;
  isLoading: boolean;
  error: Error | null;
}

const sectionStyle = css`
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  padding: var(--pf-t--global--spacer--400);
  margin-bottom: var(--pf-t--global--spacer--400);
`;

const subtitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--300);
`;

const formatNumber = (value: number): string => value.toLocaleString();

const formatDecimal = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const ComplexityResult: React.FC<ComplexityResultProps> = ({
  clusterName,
  complexityOutput,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Spinner
            size="lg"
            aria-label="Calculating migration complexity estimation"
          />
        </StackItem>
        <StackItem>
          <p>
            Calculating migration complexity estimation for {clusterName}...
          </p>
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

  if (!complexityOutput) {
    return null;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <div className={sectionStyle}>
          <Title headingLevel="h3">Complexity by Disk</Title>
          <p className={subtitleStyle}>
            Migration complexity analysis based on disk size and VM count. On a
            scale of 1 to 4, 1 represents the lowest complexity.
          </p>

          <Table aria-label="Complexity by disk table" variant="compact">
            <Thead>
              <Tr>
                <Th>Complexity Score</Th>
                <Th>Total Size (TB)</Th>
                <Th>VM Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {complexityOutput.complexityByDisk.map((item) => (
                <Tr key={item.score}>
                  <Td>{item.score}</Td>
                  <Td>{formatDecimal(item.totalSizeTB)}</Td>
                  <Td>{formatNumber(item.vmCount)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </StackItem>

      <StackItem>
        <div className={sectionStyle}>
          <Title headingLevel="h3">Complexity by Operating System</Title>
          <p className={subtitleStyle}>
            Migration complexity analysis based on operating system
            compatibility. On a scale of 1 to 4, 1 represents the lowest
            complexity, and 0 is unknown.
          </p>

          <Table aria-label="Complexity by OS table" variant="compact">
            <Thead>
              <Tr>
                <Th>Complexity Score</Th>
                <Th>VM Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {complexityOutput.complexityByOS.map((item) => (
                <Tr key={item.score}>
                  <Td>{item.score === 0 ? "Unknown" : item.score}</Td>
                  <Td>{formatNumber(item.vmCount)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </StackItem>
    </Stack>
  );
};

ComplexityResult.displayName = "ComplexityResult";

export default ComplexityResult;
