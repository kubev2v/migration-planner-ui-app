import type { AssessmentSubsetInventory } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { buildGroupViewModel } from "../groupViewModel";

const createSubset = (
  overrides: Partial<AssessmentSubsetInventory> = {},
): AssessmentSubsetInventory => ({
  id: "group-1",
  name: "Group 1",
  vcenterId: "vcenter-1",
  vmsCount: 350,
  createdAt: new Date(),
  inventory: {
    vcenterId: "vcenter-1",
    clusters: {},
  },
  ...overrides,
});

describe("buildGroupViewModel", () => {
  it("hides the group filter when no subset inventories exist", () => {
    const model = buildGroupViewModel({ subsetInventories: [] });

    expect(model.showGroupFilter).toBe(false);
    expect(model.groupSelectDisabled).toBe(true);
    expect(model.selectionLabel).toBe("All VMs");
  });

  it("returns All VMs plus subset options sorted by API order", () => {
    const model = buildGroupViewModel({
      subsetInventories: [
        createSubset({ id: "group-1", name: "Group 1", vmsCount: 350 }),
        createSubset({ id: "group-2", name: "Group 2", vmsCount: 180 }),
      ],
    });

    expect(model.showGroupFilter).toBe(true);
    expect(model.groupOptions).toEqual([
      { id: "all", label: "All VMs" },
      { id: "group-1", label: "Group 1 (350 VMs)" },
      { id: "group-2", label: "Group 2 (180 VMs)" },
    ]);
  });

  it("falls back to All VMs when the selected group is invalid", () => {
    const model = buildGroupViewModel({
      subsetInventories: [createSubset()],
      selectedGroupId: "missing-group",
    });

    expect(model.selectionId).toBe("all");
    expect(model.selectionLabel).toBe("All VMs");
  });

  it("uses distinct select values when a subset id collides with All VMs", () => {
    const model = buildGroupViewModel({
      subsetInventories: [
        createSubset({
          id: "all",
          name: "Empty Group",
          vmsCount: 12,
        }),
        createSubset({ id: "group-2", name: "Group 2", vmsCount: 5 }),
      ],
    });

    expect(model.groupOptions).toHaveLength(3);
    expect(model.groupOptions.map((option) => option.id)).toEqual([
      "all",
      "subset:all",
      "group-2",
    ]);
    expect(model.groupOptions[1].label).toBe("Empty Group (12 VMs)");
  });
});
