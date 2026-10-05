import { ActiveEnvironmentsInputEnvironmentsEnum } from "@openshift-migration-advisor/planner-sdk";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyManualEnvironmentForm } from "../../../manual-environment/mapEnhancementData";
import type { ManualEnvironmentWizardViewModel } from "../../../view-models/useManualEnvironmentWizardViewModel";
import { ManualEnvironmentWizardPage } from "../ManualEnvironmentWizard";

const save = vi.fn();
const cancel = vi.fn();
const reload = vi.fn();
const updateForm = vi.fn();

let mockVm: ManualEnvironmentWizardViewModel;

vi.mock("../../../view-models/useManualEnvironmentWizardViewModel", () => ({
  useManualEnvironmentWizardViewModel: () => mockVm,
}));

vi.mock("react-router-dom", () => ({
  Link: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }): React.ReactElement => <a href={to}>{children}</a>,
}));

const readyVm = (): ManualEnvironmentWizardViewModel => ({
  isLoading: false,
  loadError: null,
  assessmentName: "Legacy cluster migration",
  reportPath: "/assessments/assessment-1/report?tab=manual-details",
  form: createEmptyManualEnvironmentForm(),
  updateForm,
  isSaving: false,
  saveError: null,
  save,
  cancel,
  reload,
});

describe("ManualEnvironmentWizardPage", () => {
  beforeEach(() => {
    save.mockReset();
    cancel.mockReset();
    reload.mockReset();
    updateForm.mockReset();
    mockVm = readyVm();
  });

  it("lets any section be opened without stepping through the others", async () => {
    const user = userEvent.setup();
    render(<ManualEnvironmentWizardPage />);

    expect(
      screen.getByRole("heading", { name: "Add manual environment details" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Deployed environment")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Customer & target" }));

    expect(
      screen.getByLabelText("Target hardware framework"),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Deployed environment"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("moves between sections with Next and Back", async () => {
    const user = userEvent.setup();
    render(<ManualEnvironmentWizardPage />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("VM encryption")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Deployed environment")).toBeInTheDocument();
  });

  it("records answers and saves from any step", async () => {
    const user = userEvent.setup();
    render(<ManualEnvironmentWizardPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Increase Number of perpetual licenses",
      }),
    );
    expect(updateForm).toHaveBeenCalledWith({ perpetualLicensesCount: 1 });

    await user.click(screen.getByRole("button", { name: "vSphere core" }));
    await user.click(screen.getAllByRole("radio", { name: "Yes" })[0]);
    expect(updateForm).toHaveBeenCalledWith({ vmEncryptionEnabled: true });

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("checks the options already chosen in a multi-select", async () => {
    const user = userEvent.setup();
    mockVm = {
      ...readyVm(),
      form: {
        ...createEmptyManualEnvironmentForm(),
        activeEnvironments: [
          ActiveEnvironmentsInputEnvironmentsEnum.Qa,
          ActiveEnvironmentsInputEnvironmentsEnum.Dev,
        ],
      },
    };
    render(<ManualEnvironmentWizardPage />);

    await user.click(screen.getByLabelText("Active environments"));

    const checkboxFor = (name: string) => {
      const item = screen.getByText(name).closest("li");
      if (!item) {
        throw new Error(`Missing option ${name}`);
      }
      return within(item).getByRole("checkbox");
    };

    expect(checkboxFor("QA")).toBeChecked();
    expect(checkboxFor("Dev")).toBeChecked();
    expect(checkboxFor("Production")).not.toBeChecked();
  });

  it("cancels back to the report", async () => {
    const user = userEvent.setup();
    render(<ManualEnvironmentWizardPage />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  it("shows a save error without leaving the wizard", () => {
    mockVm = { ...readyVm(), saveError: new Error("rejected") };
    render(<ManualEnvironmentWizardPage />);
    expect(screen.getByText("rejected")).toBeInTheDocument();
  });

  it("shows a loader and a retry when the assessment cannot be loaded", async () => {
    const user = userEvent.setup();
    mockVm = { ...readyVm(), isLoading: true };
    const { rerender } = render(<ManualEnvironmentWizardPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    mockVm = { ...readyVm(), loadError: new Error("missing") };
    rerender(<ManualEnvironmentWizardPage />);
    expect(screen.getByText("missing")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
