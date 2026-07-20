import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CostEstimationFormValues } from "../../../../../models/CostEstimationModel";
import CostEstimationForm from "./CostEstimationForm";

describe("CostEstimationForm", () => {
  describe("Rendering", () => {
    it("should render all form sections", () => {
      const mockOnSubmit = vi.fn();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Verify all sections exist
      expect(screen.getByText(/VMware Solution Scope/i)).toBeInTheDocument();
      expect(screen.getByText(/Red Hat Solution Scope/i)).toBeInTheDocument();
    });

    it("should populate form with default values", () => {
      const mockOnSubmit = vi.fn();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Check default values
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const consolidationInput = screen.getByLabelText(
        /VMs Retired\/Moved to Cloud/i,
      ) as HTMLInputElement;
      expect(consolidationInput.value).toBe("10");

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const vmwareDiscountInput = screen.getByLabelText(
        /Assumed discount/i,
      ) as HTMLInputElement;
      expect(vmwareDiscountInput.value).toBe("0");

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const redhatDiscountInput = screen.getByLabelText(
        /Red Hat Discount/i,
      ) as HTMLInputElement;
      expect(redhatDiscountInput.value).toBe("0");

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const aapDiscountInput = screen.getByLabelText(
        /AAP Discount/i,
      ) as HTMLInputElement;
      expect(aapDiscountInput.value).toBe("0");
    });

    it("should render submit button", () => {
      const mockOnSubmit = vi.fn();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /Calculate/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit with correct values when form is valid", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Click submit button with defaults
      const submitButton = screen.getByRole("button", {
        name: /Calculate/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        const submittedData = mockOnSubmit.mock
          .calls[0][0] as CostEstimationFormValues;
        expect(submittedData.vmwareSolution).toBe("vmwareVcf");
        expect(submittedData.vmwareDiscount).toBe(0);
        expect(submittedData.rhEdition).toBe("OVE");
        expect(submittedData.includeACM).toBe(true);
        expect(submittedData.openshiftDiscount).toBe(0);
        expect(submittedData.withAap).toBe(false);
        expect(submittedData.aapDiscount).toBe(0);
        expect(submittedData.additionalStorageCost).toBe(0);
        expect(submittedData.thirdPartyISVCost).toBe(0);
        expect(submittedData.swingHardwareCost).toBe(0);
        expect(submittedData.consolidationPct).toBe(10);
      });
    });

    it("should submit form when user hits Enter", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Focus on an input field and press Enter
      const consolidationInput = screen.getByLabelText(
        /VMs Retired\/Moved to Cloud/i,
      );
      await user.click(consolidationInput);
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Field Validation", () => {
    it("should validate consolidation percentage is 0-100", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const consolidationInput = screen.getByLabelText(
        /VMs Retired\/Moved to Cloud/i,
      );
      await user.clear(consolidationInput);
      await user.type(consolidationInput, "120");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Cannot exceed 100%")).toBeInTheDocument();
      });
    });

    it("should validate Red Hat discount percentage is 0-100", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const redhatDiscountInput = screen.getByLabelText(/Red Hat Discount/i);
      await user.clear(redhatDiscountInput);
      await user.type(redhatDiscountInput, "150");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("Discount cannot exceed 100%"),
        ).toBeInTheDocument();
      });
    });

    it("should validate AAP discount percentage is 0-100", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const aapDiscountInput = screen.getByLabelText(/AAP Discount/i);
      await user.clear(aapDiscountInput);
      await user.type(aapDiscountInput, "-5");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("Discount cannot be negative"),
        ).toBeInTheDocument();
      });
    });

    it("should validate VMware discount percentage is 0-100", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const vmwareDiscountInput = screen.getByLabelText(/Assumed discount/i);
      await user.clear(vmwareDiscountInput);
      await user.type(vmwareDiscountInput, "110");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("Discount cannot exceed 100%"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("ACM Checkbox Business Logic", () => {
    it('should show "ACM for Virtualization" label when OVE is selected', () => {
      const mockOnSubmit = vi.fn();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // OVE is default
      const acmCheckbox = screen.getByRole("checkbox", {
        name: /Include ACM for Virtualization Add-on/i,
      });
      expect(acmCheckbox).toBeInTheDocument();
      expect(acmCheckbox).not.toBeDisabled();
    });

    it('should show "ACM for Kubernetes" label when OKE is selected', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Change to OKE
      const editionSelect = screen.getByLabelText(/OpenShift Edition/i);
      await user.selectOptions(editionSelect, "OKE");

      await waitFor(() => {
        const acmCheckbox = screen.getByRole("checkbox", {
          name: /Include ACM for Kubernetes Add-on/i,
        });
        expect(acmCheckbox).toBeInTheDocument();
        expect(acmCheckbox).not.toBeDisabled();
      });
    });

    it("should disable and check ACM checkbox when OPP is selected", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Change to OPP
      const editionSelect = screen.getByLabelText(/OpenShift Edition/i);
      await user.selectOptions(editionSelect, "OPP");

      await waitFor(() => {
        const acmCheckbox = screen.getByRole("checkbox", {
          name: /ACM for Kubernetes \(Included in OPP\)/i,
        });
        expect(acmCheckbox).toBeInTheDocument();
        expect(acmCheckbox).toBeChecked();
        expect(acmCheckbox).toBeDisabled();
      });
    });

    it("should automatically check ACM when switching to OPP", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Uncheck ACM while on OVE
      const acmCheckboxOve = screen.getByRole("checkbox", {
        name: /Include ACM for Virtualization Add-on/i,
      });
      await user.click(acmCheckboxOve);
      expect(acmCheckboxOve).not.toBeChecked();

      // Switch to OPP
      const editionSelect = screen.getByLabelText(/OpenShift Edition/i);
      await user.selectOptions(editionSelect, "OPP");

      // ACM should now be checked automatically
      await waitFor(() => {
        const acmCheckboxOpp = screen.getByRole("checkbox", {
          name: /ACM for Kubernetes \(Included in OPP\)/i,
        });
        expect(acmCheckboxOpp).toBeChecked();
      });
    });

    it("should allow unchecking ACM for OKE and OCP editions", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Switch to OCP
      const editionSelect = screen.getByLabelText(/OpenShift Edition/i);
      await user.selectOptions(editionSelect, "OCP");

      await waitFor(() => {
        const acmCheckbox = screen.getByRole("checkbox", {
          name: /Include ACM for Kubernetes Add-on/i,
        });
        expect(acmCheckbox).toBeChecked(); // Default is true
        expect(acmCheckbox).not.toBeDisabled();
      });

      // Uncheck it
      const acmCheckbox = screen.getByRole("checkbox", {
        name: /Include ACM for Kubernetes Add-on/i,
      });
      await user.click(acmCheckbox);

      expect(acmCheckbox).not.toBeChecked();
    });
  });

  describe("Discount Fields", () => {
    it("should submit with custom discount values", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const vmwareDiscountInput = screen.getByLabelText(/Assumed discount/i);
      await user.clear(vmwareDiscountInput);
      await user.type(vmwareDiscountInput, "10");

      const redhatDiscountInput = screen.getByLabelText(/Red Hat Discount/i);
      await user.clear(redhatDiscountInput);
      await user.type(redhatDiscountInput, "25");

      const aapDiscountInput = screen.getByLabelText(/AAP Discount/i);
      await user.clear(aapDiscountInput);
      await user.type(aapDiscountInput, "15");

      const submitButton = screen.getByRole("button", {
        name: /Calculate/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        const submittedData = mockOnSubmit.mock
          .calls[0][0] as CostEstimationFormValues;
        expect(submittedData.vmwareDiscount).toBe(10);
        expect(submittedData.openshiftDiscount).toBe(25);
        expect(submittedData.aapDiscount).toBe(15);
      });
    });
  });

  describe("VMware Solution Select", () => {
    it("should default to VCF", () => {
      const mockOnSubmit = vi.fn();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const vmwareSolutionSelect = screen.getByLabelText("VMware solution", {
        exact: true,
      }) as HTMLInputElement;
      expect(vmwareSolutionSelect.value).toBe("vmwareVcf");
    });

    it("should allow changing VMware solution", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();
      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const vmwareSolutionSelect = screen.getByLabelText("VMware solution", {
        exact: true,
      });
      await user.selectOptions(vmwareSolutionSelect, "vmwareVvf");

      const submitButton = screen.getByRole("button", {
        name: /Calculate/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        const submittedData = mockOnSubmit.mock
          .calls[0][0] as CostEstimationFormValues;
        expect(submittedData.vmwareSolution).toBe("vmwareVvf");
      });
    });
  });

  describe("Edition Selection", () => {
    it("should allow changing OpenShift edition", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      // Change to OCP using selectOptions (FormSelect is a native select)
      const editionSelect = screen.getByLabelText(/OpenShift Edition/i);
      await user.selectOptions(editionSelect, "OCP");

      // Submit and verify
      const submitButton = screen.getByRole("button", {
        name: /Calculate/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        const submittedData = mockOnSubmit.mock
          .calls[0][0] as CostEstimationFormValues;
        expect(submittedData.rhEdition).toBe("OCP");
      });
    });
  });

  describe("Error Clearing", () => {
    it("should clear error when user corrects invalid input", async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<CostEstimationForm onSubmit={mockOnSubmit} />);

      const consolidationInput = screen.getByLabelText(
        /VMs Retired\/Moved to Cloud/i,
      );

      // Enter invalid value
      await user.clear(consolidationInput);
      await user.type(consolidationInput, "150");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Cannot exceed 100%")).toBeInTheDocument();
      });

      // Correct the value
      await user.clear(consolidationInput);
      await user.type(consolidationInput, "20");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText("Cannot exceed 100%"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
