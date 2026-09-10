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

const emptyEstimationByComplexityResponse = {
  complexityByOsDisk: [],
  complexityMatrix: {},
};

describe("useComplexityToolViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsStore.calculateComplexityEstimation.mockResolvedValue(
      emptyComplexityResponse,
    );
    mockAssessmentsStore.calculateEstimationByComplexity.mockResolvedValue(
      emptyEstimationByComplexityResponse,
    );
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

  it("does not fetch complexity when initial complexity is already provided", async () => {
    const { result } = renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: true,
        initialComplexityEstimation: emptyComplexityResponse,
      }),
    );

    expect(result.current.complexityEstimation).toEqual(
      emptyComplexityResponse,
    );
    expect(result.current.isCalculatingComplexity).toBe(false);
    expect(result.current.isCalculatingEstimationByComplexity).toBe(true);

    await waitFor(() => {
      expect(
        mockAssessmentsStore.calculateEstimationByComplexity,
      ).toHaveBeenCalled();
      expect(result.current.estimationByComplexity).toEqual(
        emptyEstimationByComplexityResponse,
      );
    });

    expect(
      mockAssessmentsStore.calculateComplexityEstimation,
    ).not.toHaveBeenCalled();
    expect(result.current.isCalculatingEstimationByComplexity).toBe(false);
  });

  it("does not fetch estimation by complexity when that result is already provided", async () => {
    const { result } = renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: true,
        initialEstimationByComplexity: emptyEstimationByComplexityResponse,
      }),
    );

    expect(result.current.estimationByComplexity).toEqual(
      emptyEstimationByComplexityResponse,
    );
    expect(result.current.isCalculatingEstimationByComplexity).toBe(false);
    expect(result.current.isCalculatingComplexity).toBe(true);

    await waitFor(() => {
      expect(
        mockAssessmentsStore.calculateComplexityEstimation,
      ).toHaveBeenCalled();
      expect(result.current.complexityEstimation).toEqual(
        emptyComplexityResponse,
      );
    });

    expect(
      mockAssessmentsStore.calculateEstimationByComplexity,
    ).not.toHaveBeenCalled();
    expect(result.current.isCalculatingComplexity).toBe(false);
  });

  it("does not fetch either result when both initials are already provided", async () => {
    const { result } = renderHook(() =>
      useComplexityToolViewModel("assessment-1", "domain-c8", {
        autoLoad: true,
        initialComplexityEstimation: emptyComplexityResponse,
        initialEstimationByComplexity: emptyEstimationByComplexityResponse,
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
    expect(result.current.complexityEstimation).toEqual(
      emptyComplexityResponse,
    );
    expect(result.current.estimationByComplexity).toEqual(
      emptyEstimationByComplexityResponse,
    );
    expect(result.current.isCalculatingComplexity).toBe(false);
    expect(result.current.isCalculatingEstimationByComplexity).toBe(false);
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
