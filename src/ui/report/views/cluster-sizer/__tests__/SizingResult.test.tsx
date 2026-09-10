import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_FORM_VALUES } from "../constants";
import { SizingResult } from "../SizingResult";
import { mockUtilizationComparisonResponse } from "./mocks/ClusterRequirementsResponse.mock";

describe("SizingResult", () => {
  const baseProps = {
    clusterName: "test-cluster",
    formValues: DEFAULT_FORM_VALUES,
    sizerOutput: null,
    isLoading: false,
  };

  it("shows utilization comparison cards when optimization succeeded", () => {
    render(
      <SizingResult
        {...baseProps}
        sizerOutput={mockUtilizationComparisonResponse}
      />,
    );

    expect(screen.getByText("100% allocation baseline")).toBeDefined();
    expect(
      screen.getByText("Recommended: based on actual usage"),
    ).toBeDefined();
    expect(screen.getByText("28")).toBeDefined();
    expect(screen.getByText("15")).toBeDefined();
    expect(
      screen.getByText("Potential infrastructure savings: 13 nodes (46%)"),
    ).toBeDefined();
    expect(screen.getByText("Cluster name")).toBeDefined();
    expect(screen.getByText("test-cluster")).toBeDefined();
    expect(screen.getByText("Workload details")).toBeDefined();
  });

  it("capitalizes the backend error message", () => {
    const error = new Error(
      "worker node size (16 CPU / 32 GB) is too small for this inventory (2680 CPU / 10452 GB). Please use larger worker nodes (recommended: at least 20 CPU / 76 GB)",
    );

    render(<SizingResult {...baseProps} error={error} />);

    expect(
      screen.getByText(
        "Worker node size (16 CPU / 32 GB) is too small for this inventory (2680 CPU / 10452 GB). Please use larger worker nodes (recommended: at least 20 CPU / 76 GB)",
      ),
    ).toBeDefined();
  });
});
