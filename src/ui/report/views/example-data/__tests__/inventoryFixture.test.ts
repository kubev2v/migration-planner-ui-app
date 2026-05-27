import { describe, expect, it } from "vitest";

import { getExampleInventory } from "../inventoryFixture";

describe("getExampleInventory", () => {
  it("preserves clusterFeatures after SDK JSON parsing", () => {
    const inventory = getExampleInventory();

    const cluster = inventory.clusters["domain-c34"] as unknown as {
      clusterFeatures?: {
        drsEnabled?: boolean;
        drsMode?: string;
        storageDrsEnabled?: boolean;
      };
    };

    expect(cluster.clusterFeatures).toEqual({
      drsEnabled: true,
      drsMode: "fullyAutomated",
      storageDrsEnabled: true,
    });
  });
});
