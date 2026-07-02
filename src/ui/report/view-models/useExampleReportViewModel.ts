import type {
  Infra,
  Inventory,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import React, { useCallback, useMemo, useState } from "react";

import { extractScopedInventoryData } from "../helpers/groupInventoryFilter";
import {
  buildClusterViewModel,
  type ClusterViewModel,
} from "../views/assessment-report/ClusterView";
import type { ExampleClusterData } from "../views/example-data/clusterSizingFixture";
import { EXAMPLE_SIZING_MAP } from "../views/example-data/clusterSizingFixture";
import { getExampleInventory } from "../views/example-data/inventoryFixture";
import { getExampleSubsetInventories } from "../views/example-data/subsetInventoryFixture";
import { useGroupInventoryFilter } from "./useGroupInventoryFilter";

export interface ExampleReportVM {
  infra: Infra | undefined;
  vms: VMs | undefined;
  clusters: { [key: string]: InventoryData } | undefined;
  clusterCount: number;
  clusterSelectDisabled: boolean;
  detectedSummaryText: string;

  selectedClusterId: string;
  clusterView: ClusterViewModel;

  isClusterSelectOpen: boolean;
  setIsClusterSelectOpen: (open: boolean) => void;

  handleClusterSelect: (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => void;

  groupView: ReturnType<typeof useGroupInventoryFilter>["groupView"];
  selectedGroupId: string;
  isGroupSelectOpen: boolean;
  setIsGroupSelectOpen: (open: boolean) => void;
  handleGroupSelect: (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => void;

  isSizingWizardOpen: boolean;
  setIsSizingWizardOpen: (open: boolean) => void;
  exampleSizing: ExampleClusterData | null;
}

export function useExampleReportViewModel(): ExampleReportVM {
  const fullInventory: Inventory = useMemo(() => getExampleInventory(), []);
  const subsetInventories = useMemo(
    () => getExampleSubsetInventories(fullInventory),
    [fullInventory],
  );

  const [userSelectedClusterId, setUserSelectedClusterId] = useState<
    string | null
  >(null);
  const [isClusterSelectOpen, setIsClusterSelectOpen] = useState(false);
  const [isSizingWizardOpen, setIsSizingWizardOpen] = useState(false);

  const resetClusterSelection = useCallback(() => {
    setUserSelectedClusterId(null);
  }, []);

  const {
    selectedGroupId,
    groupView,
    activeInventory,
    isGroupSelectOpen,
    setIsGroupSelectOpen,
    handleGroupSelect,
  } = useGroupInventoryFilter({
    subsetInventories,
    fullInventory,
    onGroupChange: resetClusterSelection,
  });

  const { infra, vms, clusters } = useMemo(
    () => extractScopedInventoryData(activeInventory, {}),
    [activeInventory],
  );

  const selectedClusterId = useMemo(
    () => userSelectedClusterId ?? "all",
    [userSelectedClusterId],
  );

  const clusterView = useMemo(
    () => buildClusterViewModel({ infra, vms, clusters, selectedClusterId }),
    [infra, vms, clusters, selectedClusterId],
  );

  const clusterCount = fullInventory.clusters
    ? Object.keys(fullInventory.clusters).length
    : 0;
  const clusterSelectDisabled = clusterView.clusterOptions.length <= 1;

  const exampleSizing =
    selectedClusterId !== "all"
      ? (EXAMPLE_SIZING_MAP[selectedClusterId] ?? null)
      : null;

  const detectedSummaryText = useMemo(() => {
    if (clusterCount <= 0) return "No clusters detected";
    const clusterLabel =
      clusterCount === 1 ? "vSphere cluster" : "vSphere clusters";
    const totalVMs = fullInventory.vcenter?.vms?.total;
    if (typeof totalVMs === "number") {
      return `Detected ${totalVMs} VMs in ${clusterCount} ${clusterLabel}`;
    }
    return `Detected ${clusterCount} ${clusterLabel}`;
  }, [fullInventory.vcenter?.vms?.total, clusterCount]);

  const handleClusterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value == null) return;
    setUserSelectedClusterId(String(value));
    setIsClusterSelectOpen(false);
  };

  return {
    infra,
    vms,
    clusters,
    clusterCount,
    clusterSelectDisabled,
    detectedSummaryText,
    selectedClusterId,
    clusterView,
    isClusterSelectOpen,
    setIsClusterSelectOpen,
    handleClusterSelect,
    groupView,
    selectedGroupId,
    isGroupSelectOpen,
    setIsGroupSelectOpen,
    handleGroupSelect,
    isSizingWizardOpen,
    setIsSizingWizardOpen,
    exampleSizing,
  };
}
