import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ClusterDrsConfiguration,
  formatDrsMode,
} from "../ClusterDrsConfiguration";

describe("ClusterDrsConfiguration", () => {
  const clusters = {
    "domain-c34": {
      clusterFeatures: {
        drsEnabled: true,
        drsMode: "fullyAutomated",
        storageDrsEnabled: true,
      },
      infra: {} as never,
      vms: {} as never,
    },
  };

  it("renders horizontal DRS configuration for selected cluster", () => {
    render(
      <ClusterDrsConfiguration
        clusters={clusters}
        selectedClusterId="domain-c34"
      />,
    );

    expect(screen.getByText("Cluster DRS Configuration")).toBeInTheDocument();
    expect(screen.getByText("DRS Status")).toBeInTheDocument();
    expect(screen.getByText("DRS Mode")).toBeInTheDocument();
    expect(screen.getByText("Storage DRS Status")).toBeInTheDocument();
    expect(screen.getByText("Fully Automated")).toBeInTheDocument();
    expect(screen.getAllByText("Enabled")).toHaveLength(2);
  });

  it("renders nothing when all clusters are selected", () => {
    const { container } = render(
      <ClusterDrsConfiguration clusters={clusters} selectedClusterId="all" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows neutral status when enabled flag is missing", () => {
    render(
      <ClusterDrsConfiguration
        clusters={{
          "domain-c34": {
            clusterFeatures: {
              drsMode: "manual",
            },
            infra: {} as never,
            vms: {} as never,
          } as never,
        }}
        selectedClusterId="domain-c34"
      />,
    );

    expect(screen.getAllByText("–")).toHaveLength(2);
    expect(screen.queryByText("Disabled")).not.toBeInTheDocument();
  });

  it("formatDrsMode maps API enum values to labels", () => {
    expect(formatDrsMode("fullyAutomated")).toBe("Fully Automated");
    expect(formatDrsMode("manual")).toBe("Manual");
  });
});
