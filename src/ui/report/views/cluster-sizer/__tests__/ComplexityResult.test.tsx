import "@testing-library/jest-dom";

import type { ComplexityOSNameEntry } from "@openshift-migration-advisor/planner-sdk";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { ComplexityResult } from "../ComplexityResult";
import { OS_CHART_MAX_BARS } from "../OsComplexityChartData";

vi.mock("@patternfly/react-charts/victory", () => ({
  Chart: ({ children }: { children?: React.ReactNode }): JSX.Element => (
    <div data-testid="os-chart">{children}</div>
  ),
  ChartAxis: (): null => null,
  ChartBar: ({
    data,
  }: {
    data: Array<{ x: string; y: number }>;
  }): JSX.Element => (
    <div data-testid="os-chart-data">{JSON.stringify(data)}</div>
  ),
  ChartPie: (): JSX.Element => <div data-testid="disk-chart" />,
  ChartThemeColor: { multiUnordered: "multiUnordered" },
  ChartTooltip: (): null => null,
  ChartVoronoiContainer: ({
    children,
  }: {
    children?: React.ReactNode;
  }): JSX.Element => <div>{children}</div>,
}));

const osEntry = (
  osName: string,
  score: number,
  vmCount: number,
): ComplexityOSNameEntry => ({
  osName,
  score,
  vmCount,
});

describe("ComplexityResult OS chart", () => {
  it("limits the chart to OS_CHART_MAX_BARS and keeps the full table", () => {
    const complexityByOSName = Array.from(
      { length: OS_CHART_MAX_BARS + 3 },
      (_, index) => osEntry(`OS ${index}`, 1, index + 1),
    );

    render(
      <ComplexityResult
        clusterName="cluster-1"
        complexityOutput={{
          complexityByDisk: [],
          complexityByOS: [],
          complexityByOSName,
          diskSizeRatings: {},
          osRatings: {},
        }}
        isLoading={false}
        error={null}
        estimationByComplexity={null}
        isLoadingEstimationByComplexity={false}
        estimationByComplexityError={null}
      />,
    );

    expect(
      screen.getByText(
        `Showing ${OS_CHART_MAX_BARS} of ${complexityByOSName.length} operating systems. The full list is in the table below.`,
      ),
    ).toBeInTheDocument();

    const chartData = JSON.parse(
      screen.getByTestId("os-chart-data").textContent ?? "[]",
    ) as Array<{ x: string }>;
    expect(chartData).toHaveLength(OS_CHART_MAX_BARS);

    expect(screen.getByText("OS 0")).toBeInTheDocument();
    expect(
      screen.getByText(`OS ${complexityByOSName.length - 1}`),
    ).toBeInTheDocument();
  });
});
