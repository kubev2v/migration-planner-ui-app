import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { manualEnvironmentReportPath } from "../../manual-environment/paths";
import { useManualEnvironmentWizardViewModel } from "../useManualEnvironmentWizardViewModel";

const mockNavigate = vi.fn();
const mockStore = {
  get: vi.fn(),
  getEnhancementData: vi.fn(),
  saveEnhancementData: vi.fn(),
};

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "assessment-1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: () => mockStore,
}));

describe("useManualEnvironmentWizardViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.get.mockResolvedValue({
      id: "assessment-1",
      name: "Legacy cluster migration",
    });
    mockStore.getEnhancementData.mockResolvedValue({
      vsphereCore: {
        vmEncryptionEnabled: true,
        srmEnabled: false,
        vmEncryptionPolicy: "keep-me",
      },
      customerDetails: { physicalLocationsCount: 2, targetHardware: "Dell" },
    });
    mockStore.saveEnhancementData.mockImplementation(
      (_id: string, data: unknown) => data,
    );
  });

  it("loads the assessment name and previously saved values", async () => {
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assessmentName).toBe("Legacy cluster migration");
    const values = result.current.formMethods.getValues();
    expect(values.vmEncryptionEnabled).toBe(true);
    expect(values.vmEncryptionPolicy).toBe("keep-me");
    expect(values.physicalLocationsCount).toBe(2);
    expect(values.targetHardware).toBe("Dell");
    expect(result.current.loadError).toBeNull();
  });

  it("saves the form and returns to the manual details tab", async () => {
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.formMethods.setValue("deployedEnvironment", "on_premises");
      result.current.formMethods.setValue("perpetualLicensesCount", 5);
    });

    await act(async () => {
      await result.current.save();
    });

    expect(mockStore.saveEnhancementData).toHaveBeenCalledWith(
      "assessment-1",
      expect.objectContaining({
        deployedEnvironment: { environment: "on_premises" },
        vmwareVersionCounts: { perpetualLicensesCount: 5 },
        vsphereCore: {
          vmEncryptionEnabled: true,
          srmEnabled: false,
          vmEncryptionPolicy: "keep-me",
        },
        customerDetails: { physicalLocationsCount: 2, targetHardware: "Dell" },
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      manualEnvironmentReportPath("assessment-1"),
    );
  });

  it("cancels without saving", async () => {
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.cancel();
    });

    expect(mockStore.saveEnhancementData).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      manualEnvironmentReportPath("assessment-1"),
    );
  });

  it("keeps the wizard open when save fails", async () => {
    mockStore.saveEnhancementData.mockRejectedValue(new Error("rejected"));
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveError?.message).toBe("rejected");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not offer a blank form when loading fails", async () => {
    mockStore.get.mockRejectedValue(new Error("missing"));
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.loadError?.message).toBe("missing");
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("blocks saving when a field fails yup validation", async () => {
    const { result } = renderHook(() => useManualEnvironmentWizardViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.formMethods.setValue("perpetualLicensesCount", -5);
    });

    await act(async () => {
      await result.current.save();
    });

    expect(mockStore.saveEnhancementData).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.saveError).not.toBeNull();
  });
});
