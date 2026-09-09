import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ALL_CLUSTERS_ID } from "../../helpers/clusterViewModel";
import { useComplexityToolViewModel } from "../useComplexityToolViewModel";

const assessmentsSnapshot: unknown[] = [];

const mockAssessmentsStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => assessmentsSnapshot),
  calculateComplexityEstimation: vi.fn(),
  calculateEstimationByComplexity: vi.fn(),
};

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: vi.fn((symbol: symbol) => {
    const key = symbol.description;
    if (key === "AssessmentsStore") return mockAssessmentsStore;
    throw new Error(`Unknown symbol: ${String(symbol)}`);
  }),
}));

const emptyComplexityResponse = {
  complexityByDisk: [],
  complexityByOS: [],
  complexityByOSName: [],
  diskSizeRatings: {},
  osRatings: {},
};

describe("useComplexityToolViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsStore.calculateComplexityEstimation.mockResolvedValue(
      emptyComplexityResponse,
    );
    mockAssessmentsStore.calculateEstimationByComplexity.mockResolvedValue({});
  });

  it("omits the UI all-clusters sentinel from complexity estimation", async () => {
    renderHook(() =>
      useComplexityToolViewModel("assessment-1", ALL_CLUSTERS_ID, {
        autoLoad: true,
      }),
    );

    await waitFor(() => {
      expect(
        mockAssessmentsStore.calculateComplexityEstimation,
      ).toHaveBeenCalled();
      expect(
        mockAssessmentsStore.calculateEstimationByComplexity,
      ).toHaveBeenCalled();
    });

    expect(
      mockAssessmentsStore.calculateComplexityEstimation,
    ).toHaveBeenCalledWith({
      id: "assessment-1",
      migrationComplexityRequest: { clusterId: "" },
    });
    expect(
      mockAssessmentsStore.calculateEstimationByComplexity,
    ).toHaveBeenCalledWith({
      id: "assessment-1",
      migrationEstimationRequest: {
        clusterId: "",
        estimationSchema: ["network-based", "storage-offload"],
        params: {
          work_hours_per_day: 8,
          post_migration_engineers: 10,
          transfer_rate_mbps: 620,
        },
      },
    });
  });

  it("loads complexity on mount when autoLoad is set", async () => {
    renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: true,
      }),
    );

    await waitFor(() => {
      expect(
        mockAssessmentsStore.calculateComplexityEstimation,
      ).toHaveBeenCalled();
      expect(
        mockAssessmentsStore.calculateEstimationByComplexity,
      ).toHaveBeenCalled();
    });
  });

  it("does not fetch complexity when initial results are already provided", async () => {
    renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: true,
        initialComplexityEstimation: emptyComplexityResponse,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      mockAssessmentsStore.calculateComplexityEstimation,
    ).not.toHaveBeenCalled();
    expect(
      mockAssessmentsStore.calculateEstimationByComplexity,
    ).not.toHaveBeenCalled();
  });

  it("does not fetch complexity when autoLoad is false", async () => {
    renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: false,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      mockAssessmentsStore.calculateComplexityEstimation,
    ).not.toHaveBeenCalled();
  });
});
