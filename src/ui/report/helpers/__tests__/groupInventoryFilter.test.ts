import type {
  Host,
  Infra,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import type { SnapshotLike } from "../../../../services/html-export/types";
import {
  assessmentHasSubsetDataFetched,
  extractScopedInventoryData,
  resolveActiveInventory,
  resolveEffectiveGroupId,
} from "../groupInventoryFilter";
import { ALL_VMS_GROUP_ID } from "../groupViewModel";

const createInfra = (totalHosts: number): Infra => ({
  totalHosts,
  hosts: Array(totalHosts).fill({}) as Host[],
  clustersPerDatacenter: [],
  hostPowerStates: {},
  networks: [],
  datastores: [],
});

const createVMs = (total: number): VMs => ({
  total,
  totalMigratable: total,
  os: { Linux: total },
  cpuCores: {
    total,
    totalForMigratable: total,
    totalForMigratableWithWarnings: 0,
    totalForNotMigratable: 0,
  },
  ramGB: {
    total,
    totalForMigratable: total,
    totalForMigratableWithWarnings: 0,
    totalForNotMigratable: 0,
  },
  diskGB: {
    total: 0,
    totalForMigratable: 0,
    totalForMigratableWithWarnings: 0,
    totalForNotMigratable: 0,
  },
  diskCount: {
    total: 0,
    totalForMigratable: 0,
    totalForMigratableWithWarnings: 0,
    totalForNotMigratable: 0,
  },
  diskSizeTier: {},
  diskTypes: {},
  nicCount: {
    total: 0,
    totalForMigratable: 0,
    totalForMigratableWithWarnings: 0,
    totalForNotMigratable: 0,
  },
  migrationWarnings: [],
  notMigratableReasons: [],
  powerStates: {},
  distributionByCpuTier: {},
  distributionByMemoryTier: {},
});

describe("groupInventoryFilter", () => {
  describe("resolveEffectiveGroupId", () => {
    it("defaults to all VMs when nothing is selected", () => {
      expect(resolveEffectiveGroupId(null, [])).toBe(ALL_VMS_GROUP_ID);
    });

    it("returns a valid user selection", () => {
      const subsets = [{ id: "group-1", name: "G1" }] as never[];
      expect(resolveEffectiveGroupId("group-1", subsets)).toBe("group-1");
    });

    it("falls back to all VMs for invalid selections", () => {
      const subsets = [{ id: "group-1", name: "G1" }] as never[];
      expect(resolveEffectiveGroupId("missing", subsets)).toBe(
        ALL_VMS_GROUP_ID,
      );
    });
  });

  describe("resolveActiveInventory", () => {
    const clusterData: InventoryData = {
      infra: createInfra(5),
      vms: createVMs(10),
    };
    const fullInventory = {
      vcenterId: "vc-1",
      clusters: { "Cluster-A": clusterData },
      vcenter: { infra: createInfra(5), vms: createVMs(10) },
    };

    it("returns full inventory for all VMs selection", () => {
      expect(resolveActiveInventory(ALL_VMS_GROUP_ID, [], fullInventory)).toBe(
        fullInventory,
      );
    });

    it("returns subset inventory when a group is selected", () => {
      const subsetInventory = {
        vcenterId: "vc-1",
        clusters: {
          "Cluster-A": {
            infra: createInfra(2),
            vms: createVMs(3),
          },
        },
        vcenter: { infra: createInfra(2), vms: createVMs(3) },
      };
      const subsets = [
        { id: "group-1", name: "G1", inventory: subsetInventory },
      ] as never[];

      expect(resolveActiveInventory("group-1", subsets, fullInventory)).toBe(
        subsetInventory,
      );
    });
  });

  describe("extractScopedInventoryData", () => {
    it("prefers active inventory fields over snapshot fallbacks", () => {
      const activeInventory = {
        infra: createInfra(2),
        vms: createVMs(3),
        clusters: {
          "Cluster-A": {
            infra: createInfra(2),
            vms: createVMs(3),
          },
        },
      };
      const latestSnapshot: SnapshotLike = {
        infra: createInfra(99),
        vms: createVMs(99),
      };

      const result = extractScopedInventoryData(
        activeInventory,
        latestSnapshot,
      );
      expect(result.infra?.totalHosts).toBe(2);
      expect(result.vms?.total).toBe(3);
      expect(result.clusters).toEqual(activeInventory.clusters);
    });

    it("falls back to snapshot inventory when active inventory is empty", () => {
      const latestSnapshot: SnapshotLike = {
        inventory: {
          vcenter: {
            infra: createInfra(4),
            vms: createVMs(8),
          },
        },
      };

      const result = extractScopedInventoryData(undefined, latestSnapshot);
      expect(result.infra?.totalHosts).toBe(4);
      expect(result.vms?.total).toBe(8);
    });
  });

  describe("assessmentHasSubsetDataFetched", () => {
    it("returns false when snapshots are missing", () => {
      expect(assessmentHasSubsetDataFetched(undefined)).toBe(false);
      expect(assessmentHasSubsetDataFetched([])).toBe(false);
    });

    it("returns false when latest snapshot omits subsetInventories (list response)", () => {
      expect(assessmentHasSubsetDataFetched([{ createdAt: new Date() }])).toBe(
        false,
      );
    });

    it("returns true when latest snapshot includes subsetInventories (GET response)", () => {
      expect(
        assessmentHasSubsetDataFetched([
          { createdAt: new Date() },
          { createdAt: new Date(), subsetInventories: null },
        ]),
      ).toBe(true);
    });
  });
});
