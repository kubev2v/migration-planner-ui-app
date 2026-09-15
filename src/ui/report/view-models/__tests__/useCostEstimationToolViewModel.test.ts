import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CostEstimationFormValues } from "../../../../models/CostEstimationModel";
import { ALL_CLUSTERS_ID } from "../../helpers/clusterViewModel";
import { useCostEstimationToolViewModel } from "../useCostEstimationToolViewModel";

const assessmentsSnapshot: unknown[] = [];

const mockAssessmentsStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => assessmentsSnapshot),
  calculateCostEstimation: vi.fn(),
};

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: vi.fn((symbol: symbol) => {
    const key = symbol.description;
    if (key === "AssessmentsStore") return mockAssessmentsStore;
    throw new Error(`Unknown symbol: ${String(symbol)}`);
  }),
}));

const formValues: CostEstimationFormValues = {
  vmwareSolution: "vmwareVcf",
  vmwareDiscount: 10,
  rhEdition: "OVE",
  includeACM: true,
  openshiftDiscount: 5,
  withAap: false,
  aapDiscount: 0,
  additionalStorageCost: 100,
  thirdPartyISVCost: 200,
  swingHardwareCost: 300,
  consolidationPct: 10,
};

const emptyCostEstimationResponse = {
  calculatorVersion: "1.0.0",
  customerEnvironment: {
    coresPerSocket: 14,
    socketsPerHost: 2,
    totalEsxiHosts: 10,
    totalVirtualMachines: 100,
  },
  targetEnvironment: {
    targetHosts: 9,
    targetVMs: 90,
    consolidationPct: 10,
    effectiveCoresPerSocket: 14,
    totalLicensedCores: 252,
    rhSubsRequired: 9,
  },
  vmware: {
    vmwareSolution: "vmwareVcf",
    totalThreeYearCostEstimation: 1000,
    breakdown: {
      softwareSubscriptions: 1000,
      ansibleAutomationPlatform: 0,
      migrationConsultingServices: 0,
      swingHardwareUpgrades: 0,
      additionalStorageCosts: 0,
      thirdPartyIsvCosts: 0,
    },
  },
  redhat: {
    rhEdition: "OVE",
    totalThreeYearCostEstimation: 800,
    breakdown: {
      softwareSubscriptions: 800,
      ansibleAutomationPlatform: 0,
      migrationConsultingServices: 0,
      swingHardwareUpgrades: 0,
      additionalStorageCosts: 0,
      thirdPartyIsvCosts: 0,
    },
  },
  savings: {
    absoluteThreeYearUsd: 200,
    percentage: 20,
  },
};

describe("useCostEstimationToolViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsStore.calculateCostEstimation.mockResolvedValue(
      emptyCostEstimationResponse,
    );
  });

  it("sends assessment scope and omits the UI all-clusters sentinel", async () => {
    const { result } = renderHook(() =>
      useCostEstimationToolViewModel("assessment-1", ALL_CLUSTERS_ID),
    );

    await act(async () => {
      await result.current.calculateCostEstimation(formValues);
    });

    expect(mockAssessmentsStore.calculateCostEstimation).toHaveBeenCalledWith({
      assessmentId: "assessment-1",
      scope: "assessment",
      vmwareSolution: {
        name: "vmwareVcf",
        discount: 10,
      },
      rhEdition: {
        name: "OVE",
        includeACM: true,
        openshiftDiscount: 5,
        withAap: false,
        aapDiscount: 0,
        thirdPartyISVCost: 200,
        additionalStorageCost: 100,
        swingHardwareCost: 300,
      },
      consolidationPct: 10,
    });
    expect(result.current.costEstimation).toEqual(emptyCostEstimationResponse);
  });

  it("sends cluster scope and the selected cluster id", async () => {
    const { result } = renderHook(() =>
      useCostEstimationToolViewModel("assessment-1", "domain-c8"),
    );

    await act(async () => {
      await result.current.calculateCostEstimation(formValues);
    });

    expect(mockAssessmentsStore.calculateCostEstimation).toHaveBeenCalledWith({
      assessmentId: "assessment-1",
      clusterId: "domain-c8",
      scope: "cluster",
      vmwareSolution: {
        name: "vmwareVcf",
        discount: 10,
      },
      rhEdition: {
        name: "OVE",
        includeACM: true,
        openshiftDiscount: 5,
        withAap: false,
        aapDiscount: 0,
        thirdPartyISVCost: 200,
        additionalStorageCost: 100,
        swingHardwareCost: 300,
      },
      consolidationPct: 10,
    });
  });
});
