import type {
  AssessmentSubsetInventory,
  Inventory,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";

const EXAMPLE_SUBSET_CREATED_AT = new Date("2026-06-29T12:00:00.000Z");

const scaleVms = (vms: VMs, targetTotal: number): VMs => {
  if (targetTotal >= vms.total) {
    return vms;
  }

  const ratio = targetTotal / vms.total;

  return {
    ...vms,
    total: targetTotal,
    totalMigratable: Math.round(vms.totalMigratable * ratio),
    totalMigratableWithWarnings: Math.round(
      (vms.totalMigratableWithWarnings ?? vms.totalMigratable) * ratio,
    ),
    cpuCores: vms.cpuCores
      ? {
          ...vms.cpuCores,
          total: Math.round(vms.cpuCores.total * ratio),
          totalForMigratableWithWarnings: Math.round(
            vms.cpuCores.totalForMigratableWithWarnings * ratio,
          ),
          totalForNotMigratable: Math.round(
            vms.cpuCores.totalForNotMigratable * ratio,
          ),
        }
      : vms.cpuCores,
    ramGB: vms.ramGB
      ? {
          ...vms.ramGB,
          total: Math.round(vms.ramGB.total * ratio),
          totalForMigratableWithWarnings: Math.round(
            vms.ramGB.totalForMigratableWithWarnings * ratio,
          ),
          totalForNotMigratable: Math.round(
            vms.ramGB.totalForNotMigratable * ratio,
          ),
        }
      : vms.ramGB,
  };
};

const buildSubsetInventory = ({
  id,
  name,
  vcenterId,
  clusterKey,
  clusterData,
  vmsCount,
}: {
  id: string;
  name: string;
  vcenterId: string;
  clusterKey: string;
  clusterData: InventoryData;
  vmsCount: number;
}): AssessmentSubsetInventory => {
  const clusterVms = clusterData.vms;
  const scaledCluster: InventoryData = clusterVms
    ? {
        ...clusterData,
        vms: scaleVms(clusterVms, vmsCount),
      }
    : clusterData;

  return {
    id,
    name,
    vcenterId,
    vmsCount,
    createdAt: EXAMPLE_SUBSET_CREATED_AT,
    inventory: {
      vcenterId,
      clusters: { [clusterKey]: scaledCluster },
      vcenter: scaledCluster,
    },
  };
};

/**
 * Example subset inventories for the RVTools example report.
 * Mirrors the VM-groups demo: three groups plus the full snapshot total (630 VMs).
 */
export const getExampleSubsetInventories = (
  inventory: Inventory,
): AssessmentSubsetInventory[] => {
  const vcenterId = inventory.vcenterId;
  const clusters = inventory.clusters;
  const domainC34 = clusters["domain-c34"];
  const domainC146658 = clusters["domain-c146658"];

  if (!domainC34 || !domainC146658) {
    return [];
  }

  return [
    buildSubsetInventory({
      id: "11111111-1111-4111-8111-111111111101",
      name: "Group 1",
      vcenterId,
      clusterKey: "domain-c34",
      clusterData: domainC34,
      vmsCount: 350,
    }),
    buildSubsetInventory({
      id: "11111111-1111-4111-8111-111111111102",
      name: "Group 2",
      vcenterId,
      clusterKey: "domain-c146658",
      clusterData: domainC146658,
      vmsCount: 180,
    }),
    buildSubsetInventory({
      id: "11111111-1111-4111-8111-111111111103",
      name: "Group 3",
      vcenterId,
      clusterKey: "domain-c146658",
      clusterData: domainC146658,
      vmsCount: 100,
    }),
  ];
};
