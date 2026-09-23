import type {
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildPngChartExportJobs } from "../PngChartExportJobs";

vi.mock("../VMMigrationStatus", () => ({
  VMMigrationStatus: ({
    exportView,
    exportAllViews,
    graphOnly,
  }: {
    exportView?: string;
    exportAllViews?: boolean;
    graphOnly?: boolean;
  }): JSX.Element => (
    <div
      data-testid={`vm-migration-status-${exportView}`}
      data-export-all={String(Boolean(exportAllViews))}
      data-graph-only={String(Boolean(graphOnly))}
    />
  ),
}));
vi.mock("../CpuAndMemoryOverview", () => ({
  CpuAndMemoryOverview: ({
    exportView,
    exportAllViews,
    graphOnly,
  }: {
    exportView?: string;
    exportAllViews?: boolean;
    graphOnly?: boolean;
  }): JSX.Element => (
    <div
      data-testid={`cpu-and-memory-${exportView}`}
      data-export-all={String(Boolean(exportAllViews))}
      data-graph-only={String(Boolean(graphOnly))}
    />
  ),
}));
vi.mock("../StorageOverview", () => ({
  StorageOverview: ({
    exportView,
    exportAllViews,
    graphOnly,
  }: {
    exportView?: string;
    exportAllViews?: boolean;
    graphOnly?: boolean;
  }): JSX.Element => (
    <div
      data-testid={`disks-${exportView}`}
      data-export-all={String(Boolean(exportAllViews))}
      data-graph-only={String(Boolean(graphOnly))}
    />
  ),
}));
vi.mock("../ClustersOverview", () => ({
  ClustersOverview: ({
    exportView,
    exportAllViews,
    graphOnly,
  }: {
    exportView?: string;
    exportAllViews?: boolean;
    graphOnly?: boolean;
  }): JSX.Element => (
    <div
      data-testid={`clusters-${exportView}`}
      data-export-all={String(Boolean(exportAllViews))}
      data-graph-only={String(Boolean(graphOnly))}
    />
  ),
}));
vi.mock("../HostsOverview", () => ({
  HostsOverview: ({ graphOnly }: { graphOnly?: boolean }): JSX.Element => (
    <div data-testid="hosts" data-graph-only={String(Boolean(graphOnly))} />
  ),
}));
vi.mock("../NetworkOverview", () => ({
  NetworkOverview: ({
    exportView,
    exportAllViews,
    graphOnly,
  }: {
    exportView?: string;
    exportAllViews?: boolean;
    graphOnly?: boolean;
  }): JSX.Element => (
    <div
      data-testid={`networks-${exportView}`}
      data-export-all={String(Boolean(exportAllViews))}
      data-graph-only={String(Boolean(graphOnly))}
    />
  ),
}));
vi.mock("@openshift-migration-advisor/shared-components", () => ({
  OSDistribution: (): JSX.Element => <div data-testid="operating-systems" />,
  OSBarChart: (): JSX.Element => <div data-testid="operating-systems" />,
  InfrastructureSummary: (): JSX.Element => (
    <div data-testid="infrastructure-summary" />
  ),
  VCenterClusterDetails: (): JSX.Element => (
    <div data-testid="vcenter-cluster-details" />
  ),
  HostPowerStates: (): JSX.Element => <div data-testid="host-power-states" />,
  VmPowerStates: (): JSX.Element => <div data-testid="vm-power-states" />,
  MigrationDonutChart: (): JSX.Element => <div data-testid="power-donut" />,
  CardEmptyState: ({ title }: { title: string }): JSX.Element => (
    <div data-testid="empty">{title}</div>
  ),
  REPORT_CARD_EMPTY_STATE_TITLES: {
    hostPowerStates: "Host power state data not collected",
    vmPowerStates: "VM power state data not collected",
  },
  buildHostPowerStateChart: (): {
    slices: unknown[];
    legend: Record<string, string>;
    total: number;
  } => ({ slices: [{ name: "On" }], legend: {}, total: 1 }),
  buildVmPowerStateChart: (): {
    slices: unknown[];
    legend: Record<string, string>;
    total: number;
  } => ({ slices: [], legend: {}, total: 0 }),
  buildInfrastructureSummary: (): { vmwareVersion: string } => ({
    vmwareVersion: "—",
  }),
  buildClusterDetailRows: (): [] => [],
  buildClusterDetails: (): undefined => undefined,
}));

const emptyBreakdown: VMResourceBreakdown = {
  total: 0,
  totalForMigratable: 0,
  totalForMigratableWithWarnings: 0,
  totalForNotMigratable: 0,
};

const baseInfra: Infra = {
  clustersPerDatacenter: [],
  hosts: [],
  networks: [],
  datastores: [],
  totalHosts: 0,
  hostPowerStates: {},
};

const baseVms: VMs = {
  os: { Linux: 1 },
  total: 2,
  totalMigratable: 1,
  distributionByCpuTier: {},
  distributionByMemoryTier: {},
  ramGB: emptyBreakdown,
  cpuCores: emptyBreakdown,
  diskGB: emptyBreakdown,
  diskCount: emptyBreakdown,
  diskSizeTier: {},
  diskTypes: {},
  nicCount: emptyBreakdown,
  migrationWarnings: [],
  notMigratableReasons: [],
  powerStates: {},
};

const clusters: { [key: string]: InventoryData } = {
  "cluster-a": {
    infra: baseInfra,
    vms: baseVms,
  },
};

describe("buildPngChartExportJobs", () => {
  it("creates one job per chart view instead of merging a card's views", () => {
    const aggregate = buildPngChartExportJobs({
      infra: baseInfra,
      vms: { ...baseVms, totalWithSharedDisks: 1 },
      cpuCores: emptyBreakdown,
      ramGB: emptyBreakdown,
      clusters,
      isAggregateView: true,
    });
    const clusterView = buildPngChartExportJobs({
      infra: baseInfra,
      vms: baseVms,
      cpuCores: emptyBreakdown,
      ramGB: emptyBreakdown,
      clusters,
      isAggregateView: false,
    });

    expect(aggregate.map((job) => job.filename)).toEqual([
      "infrastructure-summary",
      "vcenter-cluster-details",
      "host-power-states",
      "vm-power-states",
      "vm-migration-status-issues-vs-no-issues",
      "vm-migration-status-issues-breakdown",
      "operating-systems",
      "cpu-and-memory-memory-tiers",
      "cpu-and-memory-vcpu-tiers",
      "disks-vm-count-by-disk-type",
      "disks-vm-count",
      "disks-total-size",
      "disks-shared-disks",
      "clusters-vm-by-cluster",
      "clusters-data-center-distribution",
      "clusters-cpu-over-commitment",
      "hosts",
      "networks-network-distribution",
      "networks-nic-count",
    ]);
    expect(clusterView.map((job) => job.filename)).toEqual([
      "infrastructure-summary",
      "vcenter-cluster-details",
      "host-power-states",
      "vm-power-states",
      "vm-migration-status-issues-vs-no-issues",
      "vm-migration-status-issues-breakdown",
      "operating-systems",
      "cpu-and-memory-memory-tiers",
      "cpu-and-memory-vcpu-tiers",
      "disks-vm-count-by-disk-type",
      "disks-vm-count",
      "disks-total-size",
      "hosts",
      "networks-network-distribution",
      "networks-nic-count",
    ]);
  });

  it("renders each job as a single view without exportAllViews", () => {
    const jobs = buildPngChartExportJobs({
      infra: baseInfra,
      vms: { ...baseVms, totalWithSharedDisks: 1 },
      cpuCores: emptyBreakdown,
      ramGB: emptyBreakdown,
      clusters,
      isAggregateView: true,
    });

    for (const job of jobs) {
      const { container, unmount } = render(job.render());
      expect(container.firstChild).toBeTruthy();
      expect(container.querySelector("[data-export-all='true']")).toBeNull();
      expect(container.querySelector("[data-graph-only='false']")).toBeNull();
      unmount();
    }
  });

  it("renders power and OS jobs as graph-only frames without cards", () => {
    const jobs = buildPngChartExportJobs({
      infra: baseInfra,
      vms: baseVms,
      cpuCores: emptyBreakdown,
      ramGB: emptyBreakdown,
      clusters,
      isAggregateView: false,
    });
    const byName = Object.fromEntries(jobs.map((job) => [job.filename, job]));

    const hostPower = render(byName["host-power-states"].render());
    expect(
      hostPower.container.querySelector("[data-export-graph]"),
    ).toBeTruthy();
    expect(hostPower.getByTestId("power-donut")).toBeTruthy();
    hostPower.unmount();

    const os = render(byName["operating-systems"].render());
    expect(os.container.querySelector("[data-export-graph]")).toBeTruthy();
    expect(os.getByTestId("operating-systems")).toBeTruthy();
    os.unmount();
  });
});
