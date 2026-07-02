import type {
  AssessmentSubsetInventory,
  Infra,
  Inventory,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";

import type { SnapshotLike } from "../../../services/html-export/types";
import { ALL_VMS_GROUP_ID } from "./groupViewModel";

export type ReportInventorySource = {
  infra?: Infra;
  vms?: VMs;
  vcenter?: { infra?: Infra; vms?: VMs };
  clusters?: { [key: string]: InventoryData };
};

export const resolveEffectiveGroupId = (
  userSelectedGroupId: string | null,
  subsetInventories: AssessmentSubsetInventory[],
): string => {
  if (userSelectedGroupId !== null) {
    const isValidSelection =
      userSelectedGroupId === ALL_VMS_GROUP_ID ||
      subsetInventories.some((subset) => subset.id === userSelectedGroupId);
    if (isValidSelection) {
      return userSelectedGroupId;
    }
  }
  return ALL_VMS_GROUP_ID;
};

export const resolveActiveInventory = (
  selectedGroupId: string,
  subsetInventories: AssessmentSubsetInventory[],
  fullInventory: Inventory | ReportInventorySource | undefined,
): ReportInventorySource | undefined => {
  if (selectedGroupId !== ALL_VMS_GROUP_ID) {
    const subset = subsetInventories.find(
      (entry) => entry.id === selectedGroupId,
    );
    if (subset?.inventory) {
      return subset.inventory;
    }
  }
  return fullInventory;
};

export const extractScopedInventoryData = (
  activeInventory: ReportInventorySource | undefined,
  latestSnapshot: SnapshotLike,
): {
  infra: Infra | undefined;
  vms: VMs | undefined;
  clusters: { [key: string]: InventoryData } | undefined;
} => ({
  infra: (activeInventory?.infra ||
    activeInventory?.vcenter?.infra ||
    latestSnapshot.infra ||
    latestSnapshot.inventory?.infra ||
    latestSnapshot.inventory?.vcenter?.infra) as Infra | undefined,
  vms: (activeInventory?.vms ||
    activeInventory?.vcenter?.vms ||
    latestSnapshot.vms ||
    latestSnapshot.inventory?.vms ||
    latestSnapshot.inventory?.vcenter?.vms) as VMs | undefined,
  clusters: activeInventory?.clusters,
});

/**
 * GET assessment responses include `subsetInventories` (nullable).
 * LIST responses omit the field entirely — use that to skip redundant fetches.
 */
export const assessmentHasSubsetDataFetched = (
  snapshots: SnapshotLike[] | undefined,
): boolean => {
  if (!snapshots?.length) {
    return false;
  }
  const latestSnapshot = snapshots[snapshots.length - 1];
  return Object.prototype.hasOwnProperty.call(
    latestSnapshot,
    "subsetInventories",
  );
};
