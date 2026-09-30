import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ALL_CLUSTERS_ID } from "../../helpers/clusterViewModel";
import { mockClusterRequirementsResponse } from "../../views/cluster-sizer/__tests__/mocks/ClusterRequirementsResponse.mock";
import { useArchitectureToolViewModel } from "../useArchitectureToolViewModel";

const assessmentsSnapshot: unknown[] = [];

const mockAssessmentsStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => assessmentsSnapshot),
  calculateAssessmentClusterRequirements: vi.fn(),
};

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: vi.fn((symbol: symbol) => {
    const key = symbol.description;
    if (key === "AssessmentsStore") return mockAssessmentsStore;
    throw new Error(`Unknown symbol: ${String(symbol)}`);
  }),
}));

type ClusterRequirementsCall = [
  {
    id: string;
    clusterRequirementsRequest: { clusterId: string };
  },
];

const clusterRequirementsCalls = (): ClusterRequirementsCall[] =>
  mockAssessmentsStore.calculateAssessmentClusterRequirements.mock
    .calls as ClusterRequirementsCall[];

describe("useArchitectureToolViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsStore.calculateAssessmentClusterRequirements.mockResolvedValue(
      mockClusterRequirementsResponse,
    );
  });

  it("sends an empty clusterId for All vSphere clusters", async () => {
    const { result } = renderHook(() =>
      useArchitectureToolViewModel("assessment-1", ALL_CLUSTERS_ID),
    );

    await act(async () => {
      await result.current.calculate();
    });

    expect(clusterRequirementsCalls()[0]?.[0]).toMatchObject({
      id: "assessment-1",
      clusterRequirementsRequest: { clusterId: "" },
    });
    expect(result.current.sizerOutput).toEqual(mockClusterRequirementsResponse);
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.calculateError).toBeUndefined();
  });

  it("sends the selected cluster id for a single-cluster recommendation", async () => {
    const { result } = renderHook(() =>
      useArchitectureToolViewModel("assessment-1", "domain-c1"),
    );

    await act(async () => {
      await result.current.calculate();
    });

    expect(clusterRequirementsCalls()[0]?.[0]).toMatchObject({
      id: "assessment-1",
      clusterRequirementsRequest: { clusterId: "domain-c1" },
    });
    expect(result.current.sizerOutput).toEqual(mockClusterRequirementsResponse);
  });

  it("reports loading while the recommendation is calculated", async () => {
    let resolveRequest: (
      value: typeof mockClusterRequirementsResponse,
    ) => void = () => undefined;
    mockAssessmentsStore.calculateAssessmentClusterRequirements.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useArchitectureToolViewModel("assessment-1", ALL_CLUSTERS_ID),
    );

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.calculate();
    });

    expect(result.current.isCalculating).toBe(true);
    expect(result.current.sizerOutput).toBeNull();

    await act(async () => {
      resolveRequest(mockClusterRequirementsResponse);
      await pending;
    });

    expect(result.current.isCalculating).toBe(false);
    expect(result.current.sizerOutput).toEqual(mockClusterRequirementsResponse);
  });

  it("surfaces calculation errors for the existing results view", async () => {
    mockAssessmentsStore.calculateAssessmentClusterRequirements.mockRejectedValue(
      new Error("inventory is empty"),
    );

    const { result } = renderHook(() =>
      useArchitectureToolViewModel("assessment-1", ALL_CLUSTERS_ID),
    );

    await act(async () => {
      await result.current.calculate();
    });

    expect(result.current.calculateError?.message).toBe("inventory is empty");
    expect(result.current.sizerOutput).toBeNull();
    expect(result.current.isCalculating).toBe(false);
  });
});
