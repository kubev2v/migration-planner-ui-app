import { css } from "@emotion/css";
import type {
  ComplexityDiskScoreEntry,
  ComplexityOSNameEntry,
  MigrationComplexityResponse,
} from "@openshift-migration-advisor/planner-sdk";
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartPie,
  ChartThemeColor,
  ChartTooltip,
  ChartVoronoiContainer,
} from "@patternfly/react-charts";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Spinner,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

interface ComplexityResultProps {
  clusterName: string;
  complexityOutput: MigrationComplexityResponse | null;
  isLoading: boolean;
  error: Error | null;
}

interface ChartDatumWithScore {
  x: string;
  y: number;
  score: number;
}

interface ChartDatum {
  x: string;
  y: number;
}

const headerStyle = css`
  margin-bottom: var(--pf-t--global--spacer--200);
`;

const subtitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--400);
`;

const legendContainerStyle = css`
  display: flex;
  gap: var(--pf-t--global--spacer--200);
  margin-bottom: var(--pf-t--global--spacer--400);
  flex-wrap: wrap;
`;

const buttonGroupStyle = css`
  display: flex;
  gap: var(--pf-t--global--spacer--200);
  margin-bottom: var(--pf-t--global--spacer--500);
`;

const chartContainerStyle = css`
  overflow-x: auto;
  overflow-y: hidden;
`;

const tableHeaderStyle = css`
  font-weight: 500;
`;

const chartPieContainerStyle = css`
  overflow: visible;
  min-height: 350px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: var(--pf-t--global--spacer--600);
  margin-left: 30%;
`;

const formatNumber = (value: number): string => value.toLocaleString();

const formatPercentage = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// Complexity colors based on score
const COMPLEXITY_COLORS: Record<number, string> = {
  0: "#8A8D90", // Unknown - gray
  1: "#5BA352", // Easiest - green
  2: "#009596", // Easy - cyan
  3: "#F0AB00", // Moderate - orange/yellow
  4: "#C9190B", // Hardest - red
};

const COMPLEXITY_LABELS: Record<number, string> = {
  0: "Unknown",
  1: "Easiest",
  2: "Easy",
  3: "Moderate",
  4: "Hardest",
};

// Disk size tier labels based on score
const DISK_SIZE_LABELS: Record<number, string> = {
  1: "0-10 TB",
  2: "11-20 TB",
  3: "21-50 TB",
  4: "> 50 TB",
};

export const ComplexityResult: React.FC<ComplexityResultProps> = ({
  clusterName,
  complexityOutput,
  isLoading,
  error,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

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

  const osNameData = complexityOutput.complexityByOSName;
  const totalVMs = osNameData.reduce(
    (sum: number, item: ComplexityOSNameEntry) => sum + item.vmCount,
    0,
  );

  // Render By OS tab content
  const renderByOSTab = () => {
    const sortedOSData = ([...osNameData] as ComplexityOSNameEntry[]).sort(
      (a: ComplexityOSNameEntry, b: ComplexityOSNameEntry) => {
        // Primary sort: by complexity score (ascending: Easiest to Hardest)
        // Put score 0 (Unknown) at the end
        if (a.score === 0 && b.score !== 0) return 1;
        if (b.score === 0 && a.score !== 0) return -1;
        if (a.score !== b.score) {
          return a.score - b.score;
        }
        // Secondary sort: by VM count (descending) for same complexity
        return b.vmCount - a.vmCount;
      },
    );

    return (
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">Migration complexity by OS</Title>
        </StackItem>

        <StackItem>
          <div className={chartContainerStyle}>
            <Chart
              ariaDesc="Bar chart showing VM count per operating system colored by complexity"
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => {
                    const d = datum as ChartDatumWithScore;
                    const osName =
                      String(d.x).length > 25
                        ? `${String(d.x).substring(0, 25)}...`
                        : String(d.x);
                    return `${osName}\n${d.y} VMs - ${COMPLEXITY_LABELS[d.score]}`;
                  }}
                  labelComponent={
                    <ChartTooltip
                      style={{ fontSize: 10, fill: "white" }}
                      flyoutStyle={{
                        stroke: "#151515",
                        strokeWidth: 1,
                        fill: "#151515",
                      }}
                    />
                  }
                  constrainToVisibleArea
                />
              }
              domain={{
                y: [
                  0,
                  Math.max(
                    ...sortedOSData.map(
                      (d: ComplexityOSNameEntry) => d.vmCount,
                    ),
                  ) * 1.1,
                ],
              }}
              domainPadding={{ x: [15, 15] }}
              height={250}
              padding={{ top: 20, bottom: 70, left: 50, right: 20 }}
              themeColor={ChartThemeColor.multiUnordered}
              width={Math.max(600, sortedOSData.length * 50)}
            >
              <ChartAxis
                tickFormat={(t) => {
                  const label = String(t);
                  return label.length > 12
                    ? `${label.substring(0, 10)}...`
                    : label;
                }}
                style={{
                  tickLabels: { angle: -45, textAnchor: "end", fontSize: 10 },
                }}
              />
              <ChartAxis
                dependentAxis
                showGrid
                style={{
                  tickLabels: { fontSize: 10 },
                }}
              />
              <ChartBar
                data={sortedOSData.map((item: ComplexityOSNameEntry) => ({
                  x: item.osName,
                  y: item.vmCount,
                  score: item.score,
                }))}
                barWidth={20}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      const d = datum as ChartDatumWithScore;
                      return COMPLEXITY_COLORS[d.score] || "#8A8D90";
                    },
                  },
                }}
              />
            </Chart>
          </div>
        </StackItem>

        <StackItem>
          <div className={tableHeaderStyle}>Detailed breakdown</div>
          <Table aria-label="Complexity by OS table" variant="compact">
            <Thead>
              <Tr>
                <Th>Operating system</Th>
                <Th>Complexity</Th>
                <Th>Count</Th>
                <Th>Percentage</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedOSData.map((item: ComplexityOSNameEntry, idx: number) => (
                <Tr key={`${item.osName}-${idx}`}>
                  <Td>{item.osName}</Td>
                  <Td>
                    <Badge
                      style={{
                        backgroundColor: COMPLEXITY_COLORS[item.score],
                        color: "white",
                      }}
                    >
                      {COMPLEXITY_LABELS[item.score]}
                    </Badge>
                  </Td>
                  <Td>{formatNumber(item.vmCount)}</Td>
                  <Td>
                    {totalVMs > 0
                      ? `${formatPercentage((item.vmCount / totalVMs) * 100)}%`
                      : "0%"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    );
  };

  // Render By Disk tab content
  const renderByDiskTab = () => {
    const diskData = complexityOutput.complexityByDisk.filter(
      (item: ComplexityDiskScoreEntry) => item.vmCount > 0,
    );
    const totalDiskVMs = diskData.reduce(
      (sum: number, item: ComplexityDiskScoreEntry) => sum + item.vmCount,
      0,
    );

    return (
      <Stack hasGutter>
        <StackItem>
          <div className={headerStyle}>
            <Title headingLevel="h3">Distribution by disk size</Title>
          </div>
        </StackItem>

        <StackItem>
          <div className={chartPieContainerStyle}>
            {diskData.length > 0 ? (
              <ChartPie
                ariaDesc="Pie chart showing VM distribution by disk size tier"
                data={diskData.map((item) => ({
                  x: DISK_SIZE_LABELS[item.score],
                  y: item.vmCount,
                }))}
                labels={({ datum }) => {
                  const d = datum as ChartDatum;
                  const diskEntry = complexityOutput.complexityByDisk.find(
                    (item) => DISK_SIZE_LABELS[item.score] === d.x,
                  );
                  const score = diskEntry?.score || 0;
                  return `${d.x}\n${COMPLEXITY_LABELS[score]}\n${d.y}`;
                }}
                labelComponent={
                  <ChartTooltip
                    style={{ fontSize: 14, fill: "white" }}
                    flyoutStyle={{
                      stroke: "#151515",
                      strokeWidth: 1,
                      fill: "#151515",
                    }}
                  />
                }
                padding={{ bottom: 20, left: 20, right: 20, top: 20 }}
                height={350}
                width={350}
                colorScale={diskData.map(
                  (item) => COMPLEXITY_COLORS[item.score],
                )}
              />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </StackItem>

        <StackItem>
          <div className={tableHeaderStyle}>Detailed breakdown</div>
          <Table aria-label="Complexity by disk table" variant="compact">
            <Thead>
              <Tr>
                <Th>Disk size</Th>
                <Th>Complexity</Th>
                <Th>Count</Th>
                <Th>Percentage</Th>
              </Tr>
            </Thead>
            <Tbody>
              {diskData.map((item) => (
                <Tr key={item.score}>
                  <Td>{DISK_SIZE_LABELS[item.score]}</Td>
                  <Td>
                    <Badge
                      style={{
                        backgroundColor: COMPLEXITY_COLORS[item.score],
                        color: "white",
                      }}
                    >
                      {COMPLEXITY_LABELS[item.score]}
                    </Badge>
                  </Td>
                  <Td>{formatNumber(item.vmCount)}</Td>
                  <Td>
                    {totalDiskVMs > 0
                      ? `${formatPercentage((item.vmCount / totalDiskVMs) * 100)}%`
                      : "0%"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    );
  };

  // Render By Disk & OS tab content
  const renderByDiskAndOSTab = () => {
    return (
      <Stack hasGutter>
        <StackItem>
          <div className={headerStyle}>
            <Title headingLevel="h3">Complexity by Disk & OS</Title>
            <p className={subtitleStyle}>
              Combined view of disk size and operating system complexity.
            </p>
          </div>
        </StackItem>

        <StackItem>
          <Card>
            <CardBody>
              <p>Combined disk and OS complexity analysis coming soon.</p>
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    );
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsFlexStart" }}
          flexWrap={{ default: "wrap" }}
        >
          <FlexItem>
            <div className={headerStyle}>
              <Title headingLevel="h2">Complexity</Title>
              <p className={subtitleStyle}>
                Estimate migration complexity across operating systems, disk
                types, and their combination.
              </p>
            </div>
          </FlexItem>
          <FlexItem>
            <div className={legendContainerStyle}>
              {[1, 2, 3, 4].map((score) => (
                <Badge
                  key={score}
                  style={{
                    backgroundColor: COMPLEXITY_COLORS[score],
                    color: "white",
                  }}
                >
                  {COMPLEXITY_LABELS[score]}
                </Badge>
              ))}
            </div>
          </FlexItem>
        </Flex>
      </StackItem>

      <StackItem>
        <div className={buttonGroupStyle}>
          <Button
            variant={activeTabKey === 0 ? "primary" : "secondary"}
            onClick={() => setActiveTabKey(0)}
          >
            By OS
          </Button>
          <Button
            variant={activeTabKey === 1 ? "primary" : "secondary"}
            onClick={() => setActiveTabKey(1)}
          >
            By Disk
          </Button>
          <Button
            variant={activeTabKey === 2 ? "primary" : "secondary"}
            onClick={() => setActiveTabKey(2)}
          >
            By Disk & OS
          </Button>
        </div>
      </StackItem>

      <StackItem>
        {activeTabKey === 0 && renderByOSTab()}
        {activeTabKey === 1 && renderByDiskTab()}
        {activeTabKey === 2 && renderByDiskAndOSTab()}
      </StackItem>
    </Stack>
  );
};

ComplexityResult.displayName = "ComplexityResult";

export default ComplexityResult;
