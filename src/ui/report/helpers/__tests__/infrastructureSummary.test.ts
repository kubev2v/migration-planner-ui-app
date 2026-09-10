import type {
  Host,
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import {
  booleanToFeatureStatus,
  buildClusterDetailRows,
  buildClusterDetails,
  buildInfrastructureSummary,
  countVCenters,
  formatVSphereVersion,
  hostCapabilityStatus,
  visibleNetworks,
  vsanStatus,
} from "../infrastructureSummary";

const emptyBreakdown: VMResourceBreakdown = {
  total: 0,
  totalForMigratable: 0,
  totalForMigratableWithWarnings: 0,
  totalForNotMigratable: 0,
};

const createVms = (total: number, diskTypes: VMs["diskTypes"] = {}): VMs => ({
  total,
  totalMigratable: total,
  os: { Linux: total },
  cpuCores: emptyBreakdown,
  ramGB: emptyBreakdown,
  diskGB: emptyBreakdown,
  diskCount: emptyBreakdown,
  diskSizeTier: {},
  diskTypes,
  nicCount: emptyBreakdown,
  migrationWarnings: [],
  notMigratableReasons: [],
  powerStates: {},
  distributionByCpuTier: {},
  distributionByMemoryTier: {},
});

const createInfra = (overrides: Partial<Infra> = {}): Infra => ({
  totalHosts: 0,
  hostPowerStates: {},
  networks: [],
  datastores: [],
  ...overrides,
});

describe("formatVSphereVersion", () => {
  it("formats API versions as vSphere labels and drops trailing build zeros", () => {
    expect(formatVSphereVersion("7.0.3.0")).toBe("vSphere 7.0.3");
    expect(formatVSphereVersion("8.0.3.0")).toBe("vSphere 8.0.3");
  });

  it("keeps an existing vSphere prefix and missing values", () => {
    expect(formatVSphereVersion("vSphere 7.0.3")).toBe("vSphere 7.0.3");
    expect(formatVSphereVersion(undefined)).toBe("—");
    expect(formatVSphereVersion("")).toBe("—");
  });
});

describe("feature status helpers", () => {
  it("maps booleans to enabled, disabled, or unknown", () => {
    expect(booleanToFeatureStatus(true)).toBe("enabled");
    expect(booleanToFeatureStatus(false)).toBe("disabled");
    expect(booleanToFeatureStatus(undefined)).toBe("unknown");
  });

  it("treats vMotion as enabled when any host supports it", () => {
    const hosts: Host[] = [
      { vendor: "HPE", model: "DL360", vmotionSupported: false },
      { vendor: "HPE", model: "DL360", vmotionSupported: true },
    ];
    expect(hostCapabilityStatus(hosts, "vmotionSupported")).toBe("enabled");
  });

  it("treats vMotion as disabled when every known host reports false", () => {
    const hosts: Host[] = [
      { vendor: "HPE", model: "DL360", vmotionSupported: false },
      { vendor: "HPE", model: "DL360", vmotionSupported: false },
    ];
    expect(hostCapabilityStatus(hosts, "vmotionSupported")).toBe("disabled");
  });

  it("treats missing host capability flags as unknown", () => {
    const hosts: Host[] = [{ vendor: "HPE", model: "DL360" }];
    expect(hostCapabilityStatus(hosts, "vmotionSupported")).toBe("unknown");
    expect(hostCapabilityStatus([], "vmotionSupported")).toBe("unknown");
  });

  it("detects vSAN from datastore type or disk type", () => {
    expect(
      vsanStatus(
        createInfra({
          datastores: [
            {
              type: "vSAN",
              totalCapacityGB: 100,
              freeCapacityGB: 50,
              vendor: "VMware",
              diskId: "vsan-1",
              hardwareAcceleratedMove: true,
              protocolType: "N/A",
              model: "N/A",
            },
          ],
        }),
      ),
    ).toBe("enabled");
    expect(
      vsanStatus(
        createInfra(),
        createVms(10, { vSAN: { vmCount: 4, totalSizeTB: 1.2 } }),
      ),
    ).toBe("enabled");
    expect(vsanStatus(createInfra({ datastores: [] }))).toBe("disabled");
    expect(vsanStatus()).toBe("unknown");
  });
});

describe("buildInfrastructureSummary", () => {
  it("maps inventory metadata into the summary card model", () => {
    const summary = buildInfrastructureSummary({
      infra: createInfra({
        totalHosts: 12,
        totalDatacenters: 1,
      }),
      vcenterVersion: "7.0.3.0",
      vcenterId: "vc-1",
      clusters: {},
    });

    expect(summary).toEqual({
      vmwareVersion: "vSphere 7.0.3",
      datacenters: 1,
      vCenters: 1,
      esxiHosts: 12,
    });
  });

  it("falls back to clustersPerDatacenter length and unique vCenter ids", () => {
    const summary = buildInfrastructureSummary({
      infra: createInfra({
        totalHosts: 7,
        clustersPerDatacenter: [1, 1],
      }),
      clusters: {
        A: {
          infra: createInfra(),
          vms: createVms(1),
          vcenter: { id: "vc-a" },
        },
        B: {
          infra: createInfra(),
          vms: createVms(1),
          vcenter: { id: "vc-b" },
        },
      },
    });

    expect(summary.datacenters).toBe(2);
    expect(summary.vCenters).toBe(2);
  });
});

describe("countVCenters", () => {
  it("returns undefined when no vCenter identity is present", () => {
    expect(countVCenters(undefined, undefined)).toBeUndefined();
  });
});

describe("cluster details", () => {
  it("builds sorted aggregate rows from API cluster features", () => {
    const clusters: Record<string, InventoryData> = {
      "Cluster-Dev-02": {
        infra: createInfra({
          totalHosts: 7,
          hosts: [{ vendor: "HPE", model: "DL", vmotionSupported: true }],
          datastores: [],
        }),
        vms: createVms(350),
        clusterFeatures: { drsEnabled: false, haEnabled: true },
      },
      "Cluster-Prod-01": {
        infra: createInfra({
          totalHosts: 5,
          hosts: [{ vendor: "HPE", model: "DL", vmotionSupported: true }],
          datastores: [
            {
              type: "vSAN",
              totalCapacityGB: 10,
              freeCapacityGB: 5,
              vendor: "VMware",
              diskId: "vsan",
              hardwareAcceleratedMove: true,
              protocolType: "N/A",
              model: "N/A",
            },
          ],
        }),
        vms: createVms(280),
        clusterFeatures: { drsEnabled: true, haEnabled: true },
      },
    };

    const rows = buildClusterDetailRows(clusters);
    expect(rows.map((row) => row.name)).toEqual([
      "Cluster-Dev-02",
      "Cluster-Prod-01",
    ]);
    expect(rows[0]).toMatchObject({
      hosts: 7,
      vms: 350,
      vmotion: "enabled",
      drs: "disabled",
      vsan: "disabled",
    });
    expect(rows[1]).toMatchObject({
      hosts: 5,
      vms: 280,
      drs: "enabled",
      vsan: "enabled",
    });
  });

  it("builds the detailed cluster model including HA and network labels", () => {
    const details = buildClusterDetails({
      infra: createInfra({
        totalHosts: 7,
        hosts: [{ vendor: "HPE", model: "DL", vmotionSupported: true }],
        networks: [
          { type: "distributed", name: "VDS-Dev", vlanId: "10" },
          { type: "distributed", name: "VDS-Dev", vlanId: "11" },
          { type: "dvswitch", name: "vDSwitch0" },
        ],
      }),
      vms: createVms(350),
      clusterFeatures: { drsEnabled: false, haEnabled: true },
    });

    expect(details).toMatchObject({
      hosts: 7,
      vms: 350,
      networksDetected: 2,
      vmotion: "enabled",
      drs: "disabled",
      ha: "enabled",
      vsan: "disabled",
    });
    expect(details?.networks.map((network) => network.displayName)).toEqual([
      "VDS-Dev (VLAN 10)",
      "VDS-Dev (VLAN 11)",
    ]);
  });
});

describe("visibleNetworks", () => {
  it("omits unnamed networks and dvswitches", () => {
    expect(
      visibleNetworks(
        createInfra({
          networks: [
            { type: "distributed", name: "  " },
            { type: "dvswitch", name: "switch" },
            { type: "standard", name: "VM Network" },
          ],
        }),
      ),
    ).toEqual([
      { name: "VM Network", vlanId: undefined, displayName: "VM Network" },
    ]);
  });
});
