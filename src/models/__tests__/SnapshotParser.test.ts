import type { Snapshot as SnapshotModel } from "@openshift-migration-advisor/planner-sdk";
import { describe, expect, it } from "vitest";

import { hasUsefulData, parseLatestSnapshot } from "../SnapshotParser";

const buildSnapshot = (
  createdAt: string,
  data: Partial<SnapshotModel>,
): SnapshotModel => {
  return {
    createdAt,
    ...data,
  } as unknown as SnapshotModel;
};

const buildLegacySnapshot = (
  createdAt: string,
  data: Record<string, unknown>,
): SnapshotModel => {
  return {
    createdAt,
    ...data,
  } as unknown as SnapshotModel;
};

describe("parseLatestSnapshot", () => {
  it("returns null timestamps when there are no snapshots", () => {
    expect(parseLatestSnapshot(undefined)).toMatchObject({
      dataCollectedAt: null,
      importedAt: null,
    });
  });

  it("uses the latest snapshot import time and inventory createdAt", () => {
    const collectedAt = new Date("2026-06-18T08:20:00.000Z");
    const importedAt = new Date("2026-06-20T14:00:00.000Z");

    const result = parseLatestSnapshot([
      buildSnapshot("2026-06-01T00:00:00.000Z", {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: {},
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      }),
      buildSnapshot(importedAt.toISOString(), {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: {},
          createdAt: collectedAt,
        },
      }),
    ]);

    expect(result.dataCollectedAt).toEqual(collectedAt);
    expect(result.importedAt).toEqual(importedAt);
  });

  it("reads inventory created_at when createdAt is absent", () => {
    const collectedAt = "2026-06-18T08:20:00.000Z";
    const result = parseLatestSnapshot([
      buildSnapshot("2026-06-20T14:00:00.000Z", {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: {},
          created_at: collectedAt,
        } as unknown as SnapshotModel["inventory"],
      }),
    ]);

    expect(result.dataCollectedAt).toEqual(new Date(collectedAt));
  });
});

describe("hasUsefulData", () => {
  it("returns false when snapshots are empty", () => {
    expect(hasUsefulData(undefined)).toBe(false);
    expect(hasUsefulData([])).toBe(false);
  });

  it("returns true when clusters is present and non-null", () => {
    const snapshots = [
      buildSnapshot("2024-01-01T00:00:00Z", {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: {},
        },
      }),
    ];

    expect(hasUsefulData(snapshots)).toBe(true);
  });

  it("returns false when clusters is null even if legacy inventory data exists", () => {
    const snapshots = [
      buildSnapshot("2024-01-01T00:00:00Z", {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: null,
          infra: { totalHosts: 7 },
        } as unknown as SnapshotModel["inventory"],
      }),
    ];

    expect(hasUsefulData(snapshots)).toBe(false);
  });

  it("returns true when legacy inventory.infra or inventory.vms exists", () => {
    const snapshots = [
      buildSnapshot("2024-01-01T00:00:00Z", {
        inventory: {
          infra: { totalHosts: 7 },
          vms: { total: 217 },
        } as unknown as SnapshotModel["inventory"],
      }),
    ];

    expect(hasUsefulData(snapshots)).toBe(true);
  });

  it("returns true when legacy top-level infra or vms exists", () => {
    const snapshots = [
      buildLegacySnapshot("2024-01-01T00:00:00Z", {
        infra: { totalHosts: 3 },
        vms: { total: 12 },
      }),
    ];

    expect(hasUsefulData(snapshots)).toBe(true);
  });

  it("returns false when latest snapshot lacks inventory data", () => {
    const snapshots = [
      buildLegacySnapshot("2024-01-01T00:00:00Z", {
        inventory: { infra: { totalHosts: 1 } },
      }),
      buildSnapshot("2024-01-02T00:00:00Z", {
        inventory: {
          vcenterId: "vcenter-1",
          clusters: null,
        } as unknown as SnapshotModel["inventory"],
      }),
    ];

    expect(hasUsefulData(snapshots)).toBe(false);
  });
});
