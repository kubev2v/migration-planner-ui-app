import "@testing-library/jest-dom";

import type { MigrationEstimationResponse } from "@openshift-migration-advisor/planner-sdk";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useArchitectureToolViewModel } from "../../../view-models/useArchitectureToolViewModel";
import { useComplexityToolViewModel } from "../../../view-models/useComplexityToolViewModel";
import { ClusterSizingWizard } from "../ClusterSizingWizard";
import type { ClusterRequirementsResponse } from "../types";
import { mockClusterRequirementsResponse } from "./mocks/ClusterRequirementsResponse.mock";

const mockCalculate = vi.fn();
const mockSetFormValues = vi.fn();
const mockCalculateEstimation = vi.fn();
const mockSetEstimationFormValues = vi.fn();

const mockArchitectureViewModel = {
  formValues: {
    clusterMode: "full-ha" as const,
    workerNodePreset: "custom" as const,
    customCpu: 32,
    customMemoryGb: 128,
    haReplicas: 3 as const,
    cpuOvercommitRatio: 6,
    memoryOvercommitRatio: 4,
    scheduleOnControlPlane: false,
    smtEnabled: false,
    smtThreads: 32,
    controlPlaneCpu: 16,
    controlPlaneMemoryGb: 32,
  },
  setFormValues: mockSetFormValues,
  showWorkerNode: true,
  showControlPlane: true,
  showControlPlaneScheduling: true,
  showSmt: true,
  calculate: mockCalculate,
  isCalculating: false,
  sizerOutput: null as ClusterRequirementsResponse | null,
  calculateError: undefined as Error | undefined,
  isFormValid: true,
};

const mockTimeEstimationViewModel = {
  estimationFormValues: {
    transferRateMbps: 5000,
    workHoursPerDay: 12,
    troubleshootMinsPerVm: 90,
    postMigrationEngineers: 25,
  },
  setEstimationFormValues: mockSetEstimationFormValues,
  migrationEstimation: null as MigrationEstimationResponse | null,
  isCalculatingEstimation: false,
  estimationError: undefined as Error | undefined,
  calculateEstimation: mockCalculateEstimation,
};

const mockComplexityViewModel = {
  complexityEstimation: null,
  isCalculatingComplexity: false,
  complexityError: undefined as Error | undefined,
  estimationByComplexity: null,
  isCalculatingEstimationByComplexity: false,
  estimationByComplexityError: undefined as Error | undefined,
};

vi.mock("../../../view-models/useArchitectureToolViewModel", () => ({
  useArchitectureToolViewModel: vi.fn(() => mockArchitectureViewModel),
}));

vi.mock("../../../view-models/useTimeEstimationToolViewModel", () => ({
  useTimeEstimationToolViewModel: vi.fn(() => mockTimeEstimationViewModel),
}));

vi.mock("../../../view-models/useComplexityToolViewModel", () => ({
  useComplexityToolViewModel: vi.fn(() => mockComplexityViewModel),
}));

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

vi.mock("../TimeEstimationForm", () => ({
  TimeEstimationForm: (): React.ReactElement => (
    <div data-testid="time-estimation-form">Time Estimation Form</div>
  ),
}));

vi.mock("../TimeEstimationResult", () => ({
  TimeEstimationResult: ({
    isLoading,
  }: {
    isLoading: boolean;
  }): React.ReactElement => (
    <div data-testid="time-estimation-result">
      {isLoading ? "Loading..." : "Time Estimation Results"}
    </div>
  ),
  generateTimeEstimationPlainText: vi.fn(() => "plain text"),
}));

vi.mock("../ComplexityResult", () => ({
  ComplexityResult: ({
    isLoading,
  }: {
    isLoading: boolean;
  }): React.ReactElement => (
    <div data-testid="complexity-result">
      {isLoading ? "Loading..." : "Complexity Results"}
    </div>
  ),
}));

const defaultProps = {
  tool: "architecture" as const,
  onBack: vi.fn(),
  clusterName: "test-cluster",
  clusterId: "cluster-1",
  assessmentId: "assessment-1",
};

describe("ClusterSizingWizard", () => {
  beforeEach(() => {
    mockCalculate.mockResolvedValue(undefined);
    mockCalculateEstimation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockArchitectureViewModel.isCalculating = false;
    mockArchitectureViewModel.sizerOutput = null;
    mockArchitectureViewModel.calculateError = undefined;
    mockTimeEstimationViewModel.isCalculatingEstimation = false;
    mockTimeEstimationViewModel.migrationEstimation = null;
    mockTimeEstimationViewModel.estimationError = undefined;
    mockComplexityViewModel.isCalculatingComplexity = false;
    mockComplexityViewModel.complexityEstimation = null;
  });

  it("renders the tool with a back link instead of a modal", () => {
    render(<ClusterSizingWizard {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /Back to recommendation tools/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "OpenShift cluster architecture" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onBack when the back link is clicked", () => {
    render(<ClusterSizingWizard {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Back to recommendation tools/ }),
    );

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  describe("form first, then results", () => {
    it("shows the architecture form before results", () => {
      render(<ClusterSizingWizard {...defaultProps} />);

      expect(screen.getByTestId("sizing-input-form")).toBeInTheDocument();
      expect(screen.queryByTestId("sizing-result")).not.toBeInTheDocument();
    });

    it("submits architecture inputs and shows results beside the page title", async () => {
      mockArchitectureViewModel.sizerOutput = mockClusterRequirementsResponse;
      render(<ClusterSizingWizard {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /Generate recommendation/ }),
      );

      await waitFor(() => {
        expect(mockCalculate).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByTestId("sizing-result")).toBeInTheDocument();
      expect(screen.queryByTestId("sizing-input-form")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Cluster recommendations" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Edit migration preferences" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Copy as plain text" }),
      ).toBeInTheDocument();
    });

    it("restores the form when Edit migration preferences is clicked", async () => {
      mockArchitectureViewModel.sizerOutput = mockClusterRequirementsResponse;
      render(<ClusterSizingWizard {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /Generate recommendation/ }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("sizing-result")).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByRole("button", { name: /Edit migration preferences/ }),
      );

      expect(screen.getByTestId("sizing-input-form")).toBeInTheDocument();
      expect(screen.queryByTestId("sizing-result")).not.toBeInTheDocument();
    });
  });

  describe("time estimation", () => {
    it("shows the time estimation form and Calculate action", () => {
      render(<ClusterSizingWizard {...defaultProps} tool="time-estimation" />);

      expect(
        screen.getByRole("heading", { name: "Migration time estimation" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Calculate" }),
      ).toBeInTheDocument();
    });

    it("submits time estimation and shows results beside the page title", async () => {
      mockTimeEstimationViewModel.migrationEstimation = {
        estimation: {},
        estimationContext: { schemas: [], params: {} },
      };
      render(<ClusterSizingWizard {...defaultProps} tool="time-estimation" />);

      fireEvent.click(screen.getByRole("button", { name: "Calculate" }));

      await waitFor(() => {
        expect(mockCalculateEstimation).toHaveBeenCalledTimes(1);
        expect(
          screen.getByTestId("time-estimation-result"),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole("heading", { name: "Migration time estimation" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Edit migration preferences" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Copy as plain text" }),
      ).toBeInTheDocument();
    });
  });

  describe("complexity", () => {
    it("shows results immediately without a Calculate button", () => {
      mockComplexityViewModel.isCalculatingComplexity = true;
      render(<ClusterSizingWizard {...defaultProps} tool="complexity" />);

      expect(
        screen.queryByRole("button", { name: "Calculate complexity" }),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("complexity-result")).toBeInTheDocument();
    });

    it("asks the view model to load complexity on open", () => {
      render(<ClusterSizingWizard {...defaultProps} tool="complexity" />);

      expect(useComplexityToolViewModel).toHaveBeenCalledWith(
        "assessment-1",
        "cluster-1",
        expect.objectContaining({ autoLoad: true }),
      );
    });

    it("does not auto-load complexity in the read-only example report", () => {
      render(
        <ClusterSizingWizard {...defaultProps} tool="complexity" isReadOnly />,
      );

      expect(useComplexityToolViewModel).toHaveBeenCalledWith(
        "assessment-1",
        "cluster-1",
        expect.objectContaining({ autoLoad: false }),
      );
    });
  });

  it("does not construct architecture callbacks from other tools", () => {
    render(<ClusterSizingWizard {...defaultProps} />);

    expect(useArchitectureToolViewModel).toHaveBeenCalledTimes(1);
    expect(useComplexityToolViewModel).not.toHaveBeenCalled();
  });
});
