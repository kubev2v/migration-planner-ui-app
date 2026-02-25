import "@testing-library/jest-dom";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ClusterSizingWizard } from "../ClusterSizingWizard";

// Mock the viewModel
const mockCalculate = vi.fn();
const mockReset = vi.fn();
const mockSetFormValues = vi.fn();

vi.mock("../../../view-models/useClusterSizingWizardViewModel", () => ({
  useClusterSizingWizardViewModel: vi.fn(() => ({
    formValues: {
      workerNodePreset: "custom" as const,
      customCpu: 32,
      customMemoryGb: 128,
      cpuOvercommitRatio: 6,
      memoryOvercommitRatio: 4,
      scheduleOnControlPlane: false,
    },
    setFormValues: mockSetFormValues,
    calculate: mockCalculate,
    isCalculating: false,
    sizerOutput: null,
    calculateError: null,
    reset: mockReset,
  })),
}));

// Mock child components to simplify testing
vi.mock("../SizingInputForm", () => ({
  SizingInputForm: (): React.ReactElement => (
    <div data-testid="sizing-input-form">Migration Preferences Form</div>
  ),
}));

vi.mock("../SizingResult", () => ({
  SizingResult: (): React.ReactElement => (
    <div data-testid="sizing-result">Sizing Results</div>
  ),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  clusterName: "test-cluster",
  clusterId: "cluster-1",
  assessmentId: "assessment-1",
};

describe("ClusterSizingWizard", () => {
  beforeEach(() => {
    mockCalculate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the modal with menu when open", () => {
    render(<ClusterSizingWizard {...defaultProps} />);

    expect(
      screen.getByText("test-cluster - Recommendation"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Openshift Cluster Architecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("Migration Time Estimation")).toBeInTheDocument();
    expect(screen.getByText("Migration Complexity")).toBeInTheDocument();
    expect(screen.getByText("Migration Plan")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ClusterSizingWizard {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText("test-cluster - Recommendation"),
    ).not.toBeInTheDocument();
  });

  describe("navigation and calculation", () => {
    it("shows architecture section by default", () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      const architectureNav = screen.getByText(
        "Openshift Cluster Architecture",
      );
      // Verify element has a class (from emotion/css)
      expect(architectureNav.className).toBeTruthy();

      expect(screen.getByTestId("sizing-input-form")).toBeInTheDocument();
    });

    it("triggers calculation when clicking Generate recommendation button", async () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate recommendation/,
      });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockCalculate).toHaveBeenCalledTimes(1);
      });
    });

    it("navigates to time estimation section when menu item is clicked", async () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      const timeEstimationNav = screen.getByText("Migration Time Estimation");
      fireEvent.click(timeEstimationNav);

      await waitFor(() => {
        // Verify element has a class (from emotion/css)
        expect(timeEstimationNav.className).toBeTruthy();
      });

      expect(
        screen.getByText("Migration Time Estimation content (coming soon)"),
      ).toBeInTheDocument();
    });

    it("disables Migration Complexity menu item", () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      const complexityNav = screen.getByText("Migration Complexity");
      const complexityButton = complexityNav.closest("button");
      expect(complexityButton).toHaveAttribute("aria-disabled", "true");
      expect(complexityButton).toHaveStyle({ pointerEvents: "none" });
    });

    it("disables Migration Plan menu item", () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      const planNav = screen.getByText("Migration Plan");
      const planButton = planNav.closest("button");
      expect(planButton).toHaveAttribute("aria-disabled", "true");
      expect(planButton).toHaveStyle({ pointerEvents: "none" });
    });
  });
});
