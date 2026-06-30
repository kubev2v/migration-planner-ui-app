import { describe, expect, it } from "vitest";

import { getExampleInventory } from "../inventoryFixture";
import { getExampleSubsetInventories } from "../subsetInventoryFixture";

describe("getExampleSubsetInventories", () => {
  it("returns three demo groups with VM counts matching the design mockup", () => {
    const subsets = getExampleSubsetInventories(getExampleInventory());

    expect(subsets).toHaveLength(3);
    expect(subsets.map((subset) => subset.name)).toEqual([
      "Group 1",
      "Group 2",
      "Group 3",
    ]);
    expect(subsets.map((subset) => subset.vmsCount)).toEqual([350, 180, 100]);
  });

  it("scopes each subset inventory to a single cluster view", () => {
    const subsets = getExampleSubsetInventories(getExampleInventory());

    expect(subsets[0].inventory.clusters).toHaveProperty("domain-c34");
    expect(subsets[0].inventory.vcenter?.vms?.total).toBe(350);
    expect(subsets[1].inventory.vcenter?.vms?.total).toBe(180);
    expect(subsets[2].inventory.vcenter?.vms?.total).toBe(100);
  });
});
