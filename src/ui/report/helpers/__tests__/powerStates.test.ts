import { describe, expect, it } from "vitest";

import {
  buildHostPowerStateChart,
  buildVmPowerStateChart,
} from "../powerStates";

describe("buildHostPowerStateChart", () => {
  it("maps overallStatus green to powered on and keeps zero categories", () => {
    const chart = buildHostPowerStateChart({ green: 7 });

    expect(chart.total).toBe(7);
    expect(chart.slices.map((slice) => [slice.name, slice.count])).toEqual([
      ["Powered on", 7],
      ["Powered off", 0],
      ["Standby", 0],
      ["Not responding", 0],
      ["Maintenance", 0],
    ]);
    expect(chart.slices[0].countDisplay).toBe("7 hosts");
  });

  it("maps explicit host power and maintenance keys", () => {
    const chart = buildHostPowerStateChart({
      poweredOn: 5,
      poweredOff: 1,
      standBy: 1,
      notResponding: 1,
      inMaintenanceMode: 2,
    });

    expect(chart.total).toBe(10);
    expect(
      chart.slices.find((slice) => slice.name === "Maintenance")?.count,
    ).toBe(2);
    expect(
      chart.slices.find((slice) => slice.name === "Not responding")?.count,
    ).toBe(1);
  });
});

describe("buildVmPowerStateChart", () => {
  it("maps VM power states and omits unused suspended", () => {
    const chart = buildVmPowerStateChart({
      poweredOff: 297,
      poweredOn: 53,
    });

    expect(chart.total).toBe(350);
    expect(chart.slices.map((slice) => [slice.name, slice.count])).toEqual([
      ["Powered off", 297],
      ["Powered on", 53],
    ]);
    expect(chart.slices[0].countDisplay).toBe("297 VMs");
  });

  it("includes suspended when present", () => {
    const chart = buildVmPowerStateChart({
      poweredOn: 10,
      poweredOff: 2,
      suspended: 1,
    });

    expect(chart.slices.map((slice) => slice.name)).toEqual([
      "Powered off",
      "Powered on",
      "Suspended",
    ]);
    expect(chart.slices[2].countDisplay).toBe("1 VM");
  });
});
