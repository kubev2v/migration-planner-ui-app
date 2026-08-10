import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { StandaloneCostEstimationFormValues } from "../../../../models/StandaloneCostEstimationModel";
import StandaloneCostEstimationForm from "./StandaloneCostEstimationForm";

describe("StandaloneCostEstimationForm", () => {
  it("should call onSubmit with all filled-in values when user clicks Calculate", async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    render(<StandaloneCostEstimationForm onSubmit={mockOnSubmit} />);

    // --- Customer ---
    const customerInput = screen.getByLabelText("Customer name");
    await user.type(customerInput, "Acme Corp");

    // --- Customer environment ---
    const hostsInput = screen.getByLabelText("Total ESXi hosts");
    await user.clear(hostsInput);
    await user.type(hostsInput, "500");

    const socketsInput = screen.getByLabelText("Sockets per host");
    await user.clear(socketsInput);
    await user.type(socketsInput, "4");

    const coresInput = screen.getByLabelText("Cores per socket");
    await user.clear(coresInput);
    await user.type(coresInput, "32");

    const vmsInput = screen.getByLabelText("Current total VMs");
    await user.clear(vmsInput);
    await user.type(vmsInput, "10000");

    const consolidationInput = screen.getByLabelText(
      "VMs retired / moved to cloud (%)",
    );
    await user.clear(consolidationInput);
    await user.type(consolidationInput, "20");

    // --- Red Hat scope ---
    const editionSelect = screen.getByLabelText("OpenShift edition");
    await user.selectOptions(editionSelect, "OCP");

    // Uncheck ACM (checked by default)
    const acmCheckbox = screen.getByRole("checkbox", {
      name: /Include Advanced Cluster Management/i,
    });
    await user.click(acmCheckbox);

    // Check AAP
    const aapCheckbox = screen.getByRole("checkbox", {
      name: /Include Ansible Automation Platform/i,
    });
    await user.click(aapCheckbox);

    // Uncheck swing hardware (checked by default)
    const swingCheckbox = screen.getByRole("checkbox", {
      name: /Include swing hardware/i,
    });
    await user.click(swingCheckbox);

    // Check additional storage
    const storageCheckbox = screen.getByRole("checkbox", {
      name: /Include additional storage costs/i,
    });
    await user.click(storageCheckbox);

    // Check ISV
    const isvCheckbox = screen.getByRole("checkbox", {
      name: /Include ISV/i,
    });
    await user.click(isvCheckbox);

    // --- VMware plans ---
    // Uncheck VVF (checked by default)
    const vvfCheckbox = screen.getByRole("checkbox", {
      name: /VMware vSphere Foundation/i,
    });
    await user.click(vvfCheckbox);

    // Check VVS (unchecked by default)
    const vvsCheckbox = screen.getByRole("checkbox", {
      name: /VMware vSphere Standard/i,
    });
    await user.click(vvsCheckbox);

    // --- Unit pricing ---
    const priceVcfInput = screen.getByLabelText("VMware VCF (per core / year)");
    await user.clear(priceVcfInput);
    await user.type(priceVcfInput, "350");

    const priceVvfInput = screen.getByLabelText("VMware VVF (per core / year)");
    await user.clear(priceVvfInput);
    await user.type(priceVvfInput, "180");

    const priceVvsInput = screen.getByLabelText("VMware VVS (per core / year)");
    await user.clear(priceVvsInput);
    await user.type(priceVvsInput, "45");

    const priceOveInput = screen.getByLabelText("Red Hat OVE (per sub / year)");
    await user.clear(priceOveInput);
    await user.type(priceOveInput, "2800");

    const priceOkeInput = screen.getByLabelText("Red Hat OKE (per sub / year)");
    await user.clear(priceOkeInput);
    await user.type(priceOkeInput, "12000");

    const priceOcpInput = screen.getByLabelText("Red Hat OCP (per sub / year)");
    await user.clear(priceOcpInput);
    await user.type(priceOcpInput, "25000");

    const priceOppInput = screen.getByLabelText("Red Hat OPP (per sub / year)");
    await user.clear(priceOppInput);
    await user.type(priceOppInput, "48000");

    const priceAcmVirtInput = screen.getByLabelText(
      "ACM Virtualization (per sub / year)",
    );
    await user.clear(priceAcmVirtInput);
    await user.type(priceAcmVirtInput, "2000");

    const priceAcmK8sInput = screen.getByLabelText(
      "ACM Kubernetes (per sub / year)",
    );
    await user.clear(priceAcmK8sInput);
    await user.type(priceAcmK8sInput, "9000");

    const serverCostInput = screen.getByLabelText(
      "Server cost (per swing host)",
    );
    await user.clear(serverCostInput);
    await user.type(serverCostInput, "15000");

    // --- Discounts ---
    const discVcfInput = screen.getByLabelText("Assumed VCF discount (%)");
    await user.clear(discVcfInput);
    await user.type(discVcfInput, "5");

    const discVvfInput = screen.getByLabelText("Assumed VVF discount (%)");
    await user.clear(discVvfInput);
    await user.type(discVvfInput, "10");

    const discVvsInput = screen.getByLabelText("Assumed VVS discount (%)");
    await user.clear(discVvsInput);
    await user.type(discVvsInput, "15");

    const discRhInput = screen.getByLabelText("Assumed Red Hat discount (%)");
    await user.clear(discRhInput);
    await user.type(discRhInput, "20");

    // --- Submit ---
    const submitButton = screen.getByRole("button", { name: /Calculate/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);

      const data = mockOnSubmit.mock
        .calls[0][0] as StandaloneCostEstimationFormValues;

      // Customer
      expect(data.customerName).toBe("Acme Corp");

      // Customer environment
      expect(data.hosts).toBe(500);
      expect(data.socketsPerHost).toBe(4);
      expect(data.coresPerSocket).toBe(32);
      expect(data.vms).toBe(10000);
      expect(data.consolidationPct).toBe(20);

      // Red Hat scope
      expect(data.rhEdition).toBe("OCP");
      expect(data.includeACM).toBe(false);
      expect(data.withAap).toBe(true);
      expect(data.includeSwingHardware).toBe(false);
      expect(data.includeAdditionalStorage).toBe(true);
      expect(data.includeISV).toBe(true);

      // VMware plans
      expect(data.showVcf).toBe(true);
      expect(data.showVvf).toBe(false);
      expect(data.showVvs).toBe(true);

      // Unit pricing
      expect(data.priceVcf).toBe(350);
      expect(data.priceVvf).toBe(180);
      expect(data.priceVvs).toBe(45);
      expect(data.priceOve).toBe(2800);
      expect(data.priceOke).toBe(12000);
      expect(data.priceOcp).toBe(25000);
      expect(data.priceOpp).toBe(48000);
      expect(data.priceAcmVirt).toBe(2000);
      expect(data.priceAcmK8s).toBe(9000);
      expect(data.serverCost).toBe(15000);

      // Discounts
      expect(data.discountVcf).toBe(5);
      expect(data.discountVvf).toBe(10);
      expect(data.discountVvs).toBe(15);
      expect(data.discountRh).toBe(20);

      // Migration override not checked
      expect(data.overrideMigrationCost).toBe(false);
    });
  });
});
