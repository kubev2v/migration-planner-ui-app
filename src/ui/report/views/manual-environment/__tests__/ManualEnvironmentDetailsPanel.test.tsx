import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ManualEnvironmentDetailsViewModel } from "../../../view-models/useManualEnvironmentDetailsViewModel";
import { ManualEnvironmentDetailsPanel } from "../ManualEnvironmentDetailsPanel";

const openWizard = vi.fn();
const reload = vi.fn();

let mockVm: ManualEnvironmentDetailsViewModel;

vi.mock("../../../view-models/useManualEnvironmentDetailsViewModel", () => ({
  useManualEnvironmentDetailsViewModel: () => mockVm,
}));

const summary = {
  vmware: [{ label: "Deployed environment", value: "On-premises" }],
  vsphere: [{ label: "VM encryption", value: "No" }],
  nsx: [{ label: "NSX features", value: "Not provided" }],
  customer: [{ label: "Target hardware framework", value: "Dell" }],
};

describe("ManualEnvironmentDetailsPanel", () => {
  beforeEach(() => {
    openWizard.mockReset();
    reload.mockReset();
    mockVm = {
      isLoading: false,
      error: null,
      hasSavedDetails: false,
      summary,
      reload,
      openWizard,
    };
  });

  it("shows the empty state and opens the wizard", async () => {
    const user = userEvent.setup();
    render(<ManualEnvironmentDetailsPanel />);

    expect(
      screen.getByRole("heading", { name: "Manual environment details" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No manual environment details yet"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Add manual details" }),
    );
    expect(openWizard).toHaveBeenCalledTimes(1);
  });

  it("shows saved values and returns to the wizard from Edit details", async () => {
    const user = userEvent.setup();
    mockVm = { ...mockVm, hasSavedDetails: true };
    render(<ManualEnvironmentDetailsPanel />);

    expect(screen.getByText("On-premises")).toBeInTheDocument();
    expect(screen.getByText("Dell")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add manual details" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit details" }));
    expect(openWizard).toHaveBeenCalledTimes(1);
  });

  it("shows a spinner while details are loading", () => {
    mockVm = { ...mockVm, isLoading: true };
    render(<ManualEnvironmentDetailsPanel />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    mockVm = { ...mockVm, error: new Error("offline") };
    render(<ManualEnvironmentDetailsPanel />);

    expect(screen.getByText("offline")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
