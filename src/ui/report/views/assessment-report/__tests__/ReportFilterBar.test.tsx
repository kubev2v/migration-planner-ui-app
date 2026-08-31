import "@testing-library/jest-dom";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildGroupViewModel } from "../../../helpers/groupViewModel";
import { buildClusterViewModel } from "../ClusterView";
import { ReportFilterBar } from "../ReportFilterBar";

afterEach(() => cleanup());

const clusterView = buildClusterViewModel({
  selectedClusterId: "all",
});

const groupView = buildGroupViewModel({
  subsetInventories: [
    {
      id: "group-1",
      name: "Group 1",
      vcenterId: "vcenter-1",
      vmsCount: 10,
      createdAt: new Date("2026-06-29T12:00:00.000Z"),
      inventory: { vcenterId: "vcenter-1", clusters: {} },
    },
  ],
});

const defaultProps = {
  clusterView,
  clusterSelectDisabled: false,
  isClusterSelectOpen: false,
  onClusterSelectOpenChange: vi.fn(),
  onClusterSelect: vi.fn(),
  groupView,
  isGroupSelectOpen: false,
  onGroupSelectOpenChange: vi.fn(),
  onGroupSelect: vi.fn(),
};

describe("ReportFilterBar", () => {
  it("shows the group filter without a coming soon badge by default", () => {
    render(<ReportFilterBar {...defaultProps} />);

    expect(screen.getByText(/Filter by group:/)).toBeInTheDocument();
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("shows a coming soon badge next to the group filter when requested", () => {
    render(<ReportFilterBar {...defaultProps} groupFilterComingSoon />);

    expect(screen.getByText(/Filter by group:/)).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
