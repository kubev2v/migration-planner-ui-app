import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ALL_CLUSTERS_ID } from "../../helpers/clusterViewModel";
import { useTimeEstimationToolViewModel } from "../useTimeEstimationToolViewModel";

const assessmentsSnapshot: unknown[] = [];

const mockAssessmentsStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => assessmentsSnapshot),
  calculateMigrationEstimation: vi.fn(),
};

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: vi.fn((symbol: symbol) => {
    const key = symbol.description;
    if (key === "AssessmentsStore") return mockAssessmentsStore;
    throw new Error(`Unknown symbol: ${String(symbol)}`);
  }),
}));

const emptyEstimationResponse = {
  estimation: {
    "network-based": {
      minTotalDuration: "1h0m0s",
      maxTotalDuration: "2h0m0s",
      breakdown: {},
    },
  },
  estimationContext: { schemas: ["network-based"], params: {} },
};

describe("useTimeEstimationToolViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsStore.calculateMigrationEstimation.mockResolvedValue(
      emptyEstimationResponse,
    );
  });

  it("omits the UI all-clusters sentinel from migration-estimation", async () => {
    const { result } = renderHook(() =>
      useTimeEstimationToolViewModel("assessment-1", ALL_CLUSTERS_ID),
    );

    await act(async () => {
      await result.current.calculateEstimation();
    });

    expect(
      mockAssessmentsStore.calculateMigrationEstimation,
    ).toHaveBeenCalledWith({
      id: "assessment-1",
      migrationEstimationRequest: {
        clusterId: "",
        estimationSchema: ["network-based", "storage-offload"],
        params: {
          transfer_rate_mbps: 620,
          work_hours_per_day: 8,
          troubleshoot_mins_per_vm: 60,
          post_migration_engineers: 10,
        },
      },
    });
  });

  it("sends the selected cluster id for a single-cluster estimation", async () => {
    const { result } = renderHook(() =>
      useTimeEstimationToolViewModel("assessment-1", "domain-c8"),
    );

    await act(async () => {
      await result.current.calculateEstimation();
    });

    expect(
      mockAssessmentsStore.calculateMigrationEstimation,
    ).toHaveBeenCalledWith({
      id: "assessment-1",
      migrationEstimationRequest: {
        clusterId: "domain-c8",
        estimationSchema: ["network-based", "storage-offload"],
        params: {
          transfer_rate_mbps: 620,
          work_hours_per_day: 8,
          troubleshoot_mins_per_vm: 60,
          post_migration_engineers: 10,
        },
      },
    });
  });
});
