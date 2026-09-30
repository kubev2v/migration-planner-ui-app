import "@testing-library/jest-dom";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ALL_CLUSTERS_ID } from "../../../helpers/clusterViewModel";
import { MigrationRecommendations } from "../MigrationRecommendations";

afterEach(() => cleanup());

describe("MigrationRecommendations", () => {
  it("shows an enabled architecture card for All vSphere clusters", () => {
    render(
      <MigrationRecommendations
        selectedTool={null}
        onSelectTool={vi.fn()}
        onBack={vi.fn()}
        isAggregateView
        canOpenArchitecture
        clusterName="All vSphere clusters"
        clusterId={ALL_CLUSTERS_ID}
        assessmentId="assessment-1"
      />,
    );

    expect(
      screen.getByText("OpenShift cluster architecture"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Open OpenShift cluster architecture tool",
      }),
    ).toBeInTheDocument();
  });
});
