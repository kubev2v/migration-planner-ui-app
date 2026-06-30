import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ALL_VMS_GROUP_ID } from "../../helpers/groupViewModel";
import { getExampleInventory } from "../../views/example-data/inventoryFixture";
import { getExampleSubsetInventories } from "../../views/example-data/subsetInventoryFixture";
import { useExampleReportViewModel } from "../useExampleReportViewModel";

describe("useExampleReportViewModel", () => {
  it("shows group filter options from example subset inventories", () => {
    const { result } = renderHook(() => useExampleReportViewModel());

    expect(result.current.groupView.showGroupFilter).toBe(true);
    expect(result.current.groupView.groupOptions.length).toBeGreaterThan(1);
    expect(result.current.selectedGroupId).toBe(ALL_VMS_GROUP_ID);
  });

  it("scopes dashboard data when a group is selected", () => {
    const fullInventory = getExampleInventory();
    const subsets = getExampleSubsetInventories(fullInventory);
    const targetGroup = subsets[0];

    const { result } = renderHook(() => useExampleReportViewModel());
    const fullVmTotal = result.current.clusterView.viewVms?.total;

    act(() => {
      result.current.handleGroupSelect(undefined, targetGroup.id);
    });

    expect(result.current.selectedGroupId).toBe(targetGroup.id);
    expect(result.current.clusterView.viewVms?.total).toBe(
      targetGroup.inventory?.vcenter?.vms?.total,
    );
    expect(result.current.clusterView.viewVms?.total).not.toBe(fullVmTotal);
    expect(result.current.detectedSummaryText).toContain(
      String(fullInventory.vcenter?.vms?.total),
    );
  });

  it("resets cluster selection when group changes", () => {
    const { result } = renderHook(() => useExampleReportViewModel());

    act(() => {
      result.current.handleClusterSelect(undefined, "all");
    });
    expect(result.current.selectedClusterId).toBe("all");

    const subsets = getExampleSubsetInventories(getExampleInventory());
    act(() => {
      result.current.handleGroupSelect(undefined, subsets[0].id);
    });

    expect(result.current.selectedClusterId).toBe("all");
  });
});
