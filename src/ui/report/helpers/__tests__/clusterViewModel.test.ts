import { describe, expect, it } from "vitest";

import {
  ALL_CLUSTERS_ID,
  getClusterOptions,
  toApiClusterId,
} from "../clusterViewModel";

describe("toApiClusterId", () => {
  it("maps All vSphere clusters to an empty clusterId for the vCenter aggregate", () => {
    expect(toApiClusterId(ALL_CLUSTERS_ID)).toBe("");
  });

  it("passes through a real cluster id", () => {
    expect(toApiClusterId("domain-c8")).toBe("domain-c8");
  });
});

describe("getClusterOptions", () => {
  it("puts All vSphere clusters first", () => {
    expect(getClusterOptions()[0]).toEqual({
      id: ALL_CLUSTERS_ID,
      label: "All vSphere clusters",
    });
  });
});
