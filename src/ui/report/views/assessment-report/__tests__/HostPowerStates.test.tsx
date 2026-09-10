import "@testing-library/jest-dom";

import type {
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HostPowerStates } from "../HostPowerStates";
import { VmPowerStates } from "../VmPowerStates";

vi.mock("@openshift-migration-advisor/shared-components", () => ({
  CardEmptyState: ({ title }: { title: string }): JSX.Element => (
    <div>{title}</div>
  ),
  MigrationDonutChart: ({
    title,
    subTitle,
  }: {
    title?: string;
    subTitle?: string;
  }): JSX.Element => (
    <div data-testid="power-donut">
      {title} {subTitle}
    </div>
  ),
}));

afterEach(() => cleanup());

const emptyBreakdown: VMResourceBreakdown = {
  total: 0,
  totalForMigratable: 0,
  totalForMigratableWithWarnings: 0,
  totalForNotMigratable: 0,
};

const createVms = (powerStates: VMs["powerStates"]): VMs => ({
  os: { Linux: 1 },
  total: 350,
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
  powerStates,
});

describe("HostPowerStates", () => {
  it("renders the host power donut from inventory data", () => {
    render(
      <HostPowerStates
        infra={{
          totalHosts: 7,
          hostPowerStates: { green: 7 },
          networks: [],
          datastores: [],
        }}
      />,
    );

    expect(screen.getByText("ESXi host power states")).toBeInTheDocument();
    expect(screen.getByTestId("power-donut")).toHaveTextContent("7 Hosts");
  });

  it("shows an empty state when host power data is missing", () => {
    render(
      <HostPowerStates
        infra={{
          totalHosts: 0,
          hostPowerStates: {},
          networks: [],
          datastores: [],
        }}
      />,
    );

    expect(
      screen.getByText("Host power state data not collected"),
    ).toBeInTheDocument();
  });
});

describe("VmPowerStates", () => {
  it("renders the VM power donut from inventory data", () => {
    render(
      <VmPowerStates vms={createVms({ poweredOff: 297, poweredOn: 53 })} />,
    );

    expect(screen.getByText("VM power states")).toBeInTheDocument();
    expect(screen.getByTestId("power-donut")).toHaveTextContent("350 VMs");
  });
});
