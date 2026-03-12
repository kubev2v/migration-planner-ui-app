import "@testing-library/jest-dom";

import type {
  Host,
  Infra,
  Source,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSourceModel } from "../../../../models/SourceModel";
import type { ReportPageViewModel } from "../../view-models/useReportPageViewModel";
import Report from "../Report";

// ---------------------------------------------------------------------------
// Mock the view model hook
// ---------------------------------------------------------------------------

let mockVm: ReportPageViewModel;

vi.mock("../../view-models/useReportPageViewModel", () => ({
  useReportPageViewModel: () => mockVm,
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }): React.ReactElement => <a href={to}>{children}</a>,
  useParams: vi.fn(() => ({ id: "assessment-1" })),
}));

// Mock child components
vi.mock("../../../environment/views/AgentStatusView", () => ({
  AgentStatusView: (): React.ReactElement => (
    <div data-testid="agent-status-view" />
  ),
}));

vi.mock("../assessment-report/Dashboard", () => ({
  Dashboard: (): React.ReactElement => <div data-testid="dashboard" />,
}));

vi.mock("../../../core/components/AppPage", () => ({
  AppPage: ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <div data-testid="app-page">{children}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyBreakdown: VMResourceBreakdown = {
  total: 0,
  totalForMigratable: 0,
  totalForMigratableWithWarnings: 0,
  totalForNotMigratable: 0,
};

const createInfra = (totalHosts: number, hostsCount = 0): Infra => ({
  clustersPerDatacenter: [],
  hosts: Array(hostsCount).fill({}) as Host[],
  totalHosts,
  hostPowerStates: {},
  networks: [],
  datastores: [],
});

const createVMs = (total: number): VMs => ({
  os: { Linux: total },
  total,
  totalMigratable: total,
  cpuCores: { ...emptyBreakdown, total },
  ramGB: { ...emptyBreakdown, total: total * 4 },
  diskGB: emptyBreakdown,
  diskCount: emptyBreakdown,
  diskSizeTier: {},
  diskTypes: {},
  nicCount: emptyBreakdown,
  migrationWarnings: [],
  notMigratableReasons: [],
  powerStates: {},
  distributionByCpuTier: {},
  distributionByMemoryTier: {},
});

const mockSource = createSourceModel({
  id: "source-1",
  name: "Test Source",
  createdAt: new Date(),
  updatedAt: new Date(),
  onPremises: false,
  agent: {
    id: "agent-1",
    status: "connected" as unknown as NonNullable<Source["agent"]>["status"],
    statusInfo: "",
    credentialUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    version: "",
  },
} as Source);

import { buildClusterViewModel } from "../assessment-report/ClusterView";

function makeBaseVm(
  overrides: Partial<ReportPageViewModel> = {},
): ReportPageViewModel {
  const infra = createInfra(5, 5);
  const vms = createVMs(10);
  const clusters = {};
  const clusterView = buildClusterViewModel({
    infra,
    vms,
    clusters,
    selectedClusterId: "all",
  });

  return {
    assessmentId: "assessment-1",
    assessment: undefined,
    source: mockSource,
    isLoadingData: false,
    clusterView,
    selectedClusterId: "all",
    selectCluster: vi.fn(),
    isClusterSelectOpen: false,
    setClusterSelectOpen: vi.fn(),
    clusterSelectDisabled: true,
    infra,
    vms,
    clusters,
    latestSnapshot: {},
    lastUpdatedText: "-",
    clusterCount: 0,
    scopedClusterView: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Report", () => {
  beforeEach(() => {
    mockVm = makeBaseVm();
  });

  it("renders loading spinner when data is loading and no assessment", () => {
    mockVm = makeBaseVm({ isLoadingData: true, assessment: undefined });
    render(<Report />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders not found message when assessment does not exist", () => {
    mockVm = makeBaseVm({ assessment: undefined });
    render(<Report />);
    expect(
      screen.getByText(/The requested assessment was not found/),
    ).toBeInTheDocument();
  });

});
