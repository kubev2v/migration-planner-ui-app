import type { EnhancementData } from "@openshift-migration-advisor/planner-sdk";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { routes } from "../../../../routing/Routes";
import { useManualEnvironmentDetailsViewModel } from "../useManualEnvironmentDetailsViewModel";

const mockNavigate = vi.fn();
const mockStore = {
  getEnhancementData: vi.fn(),
};

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "assessment-1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: () => mockStore,
}));

describe("useManualEnvironmentDetailsViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.getEnhancementData.mockResolvedValue(null);
  });

  it("starts empty when the assessment has no enhancement data", async () => {
    const { result } = renderHook(() => useManualEnvironmentDetailsViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasSavedDetails).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockStore.getEnhancementData).toHaveBeenCalledWith("assessment-1");
  });

  it("shows saved details returned by the API", async () => {
    const data: EnhancementData = {
      deployedEnvironment: { environment: "on_premises" },
      vsphereCore: { vmEncryptionEnabled: true, srmEnabled: false },
    };
    mockStore.getEnhancementData.mockResolvedValue(data);

    const { result } = renderHook(() => useManualEnvironmentDetailsViewModel());

    await waitFor(() => {
      expect(result.current.hasSavedDetails).toBe(true);
    });

    expect(result.current.summary.vmware[0].value).toBe("On-premises");
    expect(result.current.summary.vsphere[0].value).toBe("Yes");
    expect(result.current.summary.vsphere[1].value).toBe("No");
  });

  it("surfaces load errors", async () => {
    mockStore.getEnhancementData.mockRejectedValue(new Error("offline"));

    const { result } = renderHook(() => useManualEnvironmentDetailsViewModel());

    await waitFor(() => {
      expect(result.current.error?.message).toBe("offline");
    });
    expect(result.current.hasSavedDetails).toBe(false);
  });

  it("opens the wizard for this assessment", async () => {
    const { result } = renderHook(() => useManualEnvironmentDetailsViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.openWizard();
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      routes.manualEnvironmentDetails("assessment-1"),
    );
  });
});
