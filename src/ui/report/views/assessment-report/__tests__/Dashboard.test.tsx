import "@testing-library/jest-dom";

import type {
  Host,
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dashboard } from "../Dashboard";

vi.mock("../OSDistribution", () => ({
  OSDistribution: (): JSX.Element => <div data-testid="os-distribution" />,
}));

const emptyBreakdown: VMResourceBreakdown = {
  total: 0,
  totalForMigratable: 0,
  totalForMigratableWithWarnings: 0,
  totalForNotMigratable: 0,
};

const histogramBreakdown: VMResourceBreakdown = {
  ...emptyBreakdown,
  histogram: { data: [], minValue: 0, step: 1 },
};

const baseInfra: Infra = {
  clustersPerDatacenter: [],
  hosts: [] as Host[],
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
  nicCount: histogramBreakdown,
  migrationWarnings: [],
  notMigratableReasons: [],
  powerStates: {},
};

afterEach(() => cleanup());

describe("Dashboard", () => {
  it("shows Operating Systems (OS distribution) only", () => {
    render(
      <Dashboard
        infra={baseInfra}
        vms={baseVms}
        cpuCores={baseVms.cpuCores}
        ramGB={baseVms.ramGB}
        clusters={
          {
            A: {
              infra: baseInfra,
              vms: { ...baseVms, total: 5 },
            },
          } satisfies Record<string, InventoryData>
        }
      />,
    );

    expect(screen.getByTestId("os-distribution")).toBeInTheDocument();
  });

  it("shows empty message when cluster data is missing", () => {
    render(
      <Dashboard
        infra={baseInfra}
        vms={baseVms}
        cpuCores={baseVms.cpuCores}
        ramGB={baseVms.ramGB}
        clusters={{} as Record<string, InventoryData>}
        isAggregateView={false}
        clusterFound={false}
      />,
    );

    expect(
      screen.getByText(/No data is available for the selected cluster/),
    ).toBeInTheDocument();
  });
});
