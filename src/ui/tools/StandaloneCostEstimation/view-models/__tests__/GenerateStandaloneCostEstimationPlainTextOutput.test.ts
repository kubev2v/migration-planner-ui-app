import { describe, expect, it } from "vitest";

import type { StandaloneCostEstimateResponse } from "../../../../../models/StandaloneCostEstimationModel";
import { GenerateStandaloneCostEstimationPlainTextOutput } from "../GenerateStandaloneCostEstimationPlainTextOutput";

describe("GenerateStandaloneCostEstimationPlainTextOutput", () => {
  it("should produce the expected plain text output with one VMware plan", () => {
    const data: StandaloneCostEstimateResponse = {
      calculatorVersion: "1.2.0",
      customerEnvironment: {
        coresPerSocket: 14,
        socketsPerHost: 2,
        totalEsxiHosts: 33,
        totalVirtualMachines: 350,
      },
      targetEnvironment: {
        targetHosts: 30,
        targetVMs: 315,
        consolidationPct: 10,
        effectiveCoresPerSocket: 14,
        totalLicensedCores: 840,
        rhSubsRequired: 30,
      },
      vmwareResults: [
        {
          vmwareSolution: "vmwareVcf",
          totalThreeYearCostEstimation: 1267200,
          breakdown: {
            softwareSubscriptions: 1267200,
            ansibleAutomationPlatform: 0,
            migrationConsultingServices: 0,
            swingHardwareUpgrades: 0,
            additionalStorageCosts: 0,
            thirdPartyIsvCosts: 0,
          },
          savingsVsRedhat: {
            absoluteThreeYearUsd: 49855,
            percentage: 4,
          },
          unitPricePerCore: 503,
        },
      ],
      redhat: {
        rhEdition: "OVE",
        totalThreeYearCostEstimation: 1217345,
        breakdown: {
          softwareSubscriptions: 468000,
          ansibleAutomationPlatform: 0,
          migrationConsultingServices: 677345,
          swingHardwareUpgrades: 72000,
          additionalStorageCosts: 0,
          thirdPartyIsvCosts: 0,
        },
      },
      assumptions: {},
    };

    expect(GenerateStandaloneCostEstimationPlainTextOutput(data)).toBe(
      `Red Hat OpenShift TCO Estimate

Customer Environment
  Total ESXi Hosts: 33
  Sockets per Host: 2
  Cores per Socket: 14
  Total VMs: 350

3-Year Total Cost of Ownership Comparison
  VMware Cloud Foundation (VCF): $1,267,200
  Red Hat OpenShift Virtualization Engine: $1,217,345

Detailed 3-Year Breakdown

                                           VMW VCF       Red Hat
  Software Subscriptions                $1,267,200      $468,000
  Ansible Automation Platform                    -             -
  Migration Consulting Services                  -      $677,345
  Swing Hardware Upgrades                        -       $72,000
  Additional Storage Costs                       -             -
  Third-party ISV Costs                          -             -
  --------------------------------------------------------------
  TOTAL 3-YEAR TCO                      $1,267,200    $1,217,345

Savings Summary
  Savings vs VMware Cloud Foundation (VCF): $49,855 (4.0%)`,
    );
  });

  it("should produce output with multiple VMware plans", () => {
    const data: StandaloneCostEstimateResponse = {
      calculatorVersion: "1.2.0",
      customerEnvironment: {
        coresPerSocket: 14,
        socketsPerHost: 2,
        totalEsxiHosts: 33,
        totalVirtualMachines: 350,
      },
      targetEnvironment: {
        targetHosts: 30,
        targetVMs: 315,
        consolidationPct: 10,
        effectiveCoresPerSocket: 14,
        totalLicensedCores: 840,
        rhSubsRequired: 30,
      },
      vmwareResults: [
        {
          vmwareSolution: "vmwareVcf",
          totalThreeYearCostEstimation: 1267200,
          breakdown: {
            softwareSubscriptions: 1267200,
            ansibleAutomationPlatform: 0,
            migrationConsultingServices: 0,
            swingHardwareUpgrades: 0,
            additionalStorageCosts: 0,
            thirdPartyIsvCosts: 0,
          },
          savingsVsRedhat: {
            absoluteThreeYearUsd: 49855,
            percentage: 4,
          },
          unitPricePerCore: 503,
        },
        {
          vmwareSolution: "vmwareVvf",
          totalThreeYearCostEstimation: 601920,
          breakdown: {
            softwareSubscriptions: 601920,
            ansibleAutomationPlatform: 0,
            migrationConsultingServices: 0,
            swingHardwareUpgrades: 0,
            additionalStorageCosts: 0,
            thirdPartyIsvCosts: 0,
          },
          savingsVsRedhat: null,
          unitPricePerCore: 239,
        },
      ],
      redhat: {
        rhEdition: "OVE",
        totalThreeYearCostEstimation: 1217345,
        breakdown: {
          softwareSubscriptions: 468000,
          ansibleAutomationPlatform: 0,
          migrationConsultingServices: 677345,
          swingHardwareUpgrades: 72000,
          additionalStorageCosts: 0,
          thirdPartyIsvCosts: 0,
        },
      },
      assumptions: {},
    };

    const output = GenerateStandaloneCostEstimationPlainTextOutput(data);

    expect(output).toContain("VMW VCF");
    expect(output).toContain("VMW VVF");
    expect(output).toContain("VMware Cloud Foundation (VCF): $1,267,200");
    expect(output).toContain("VMware vSphere Foundation (VVF): $601,920");
    expect(output).toContain(
      "Savings vs VMware Cloud Foundation (VCF): $49,855 (4.0%)",
    );
    expect(output).not.toContain("Savings vs VMware vSphere Foundation");
  });

  it("should produce output without savings when no VMware plan has savings", () => {
    const data: StandaloneCostEstimateResponse = {
      calculatorVersion: "1.2.0",
      customerEnvironment: {
        coresPerSocket: 14,
        socketsPerHost: 2,
        totalEsxiHosts: 33,
        totalVirtualMachines: 350,
      },
      targetEnvironment: {
        targetHosts: 30,
        targetVMs: 315,
        consolidationPct: 10,
        effectiveCoresPerSocket: 14,
        totalLicensedCores: 840,
        rhSubsRequired: 30,
      },
      vmwareResults: [
        {
          vmwareSolution: "vmwareVvf",
          totalThreeYearCostEstimation: 601920,
          breakdown: {
            softwareSubscriptions: 601920,
            ansibleAutomationPlatform: 0,
            migrationConsultingServices: 0,
            swingHardwareUpgrades: 0,
            additionalStorageCosts: 0,
            thirdPartyIsvCosts: 0,
          },
          savingsVsRedhat: null,
          unitPricePerCore: 239,
        },
      ],
      redhat: {
        rhEdition: "OVE",
        totalThreeYearCostEstimation: 1217345,
        breakdown: {
          softwareSubscriptions: 468000,
          ansibleAutomationPlatform: 0,
          migrationConsultingServices: 677345,
          swingHardwareUpgrades: 72000,
          additionalStorageCosts: 0,
          thirdPartyIsvCosts: 0,
        },
      },
      assumptions: {},
    };

    const output = GenerateStandaloneCostEstimationPlainTextOutput(data);
    expect(output).not.toContain("Savings Summary");
  });
});
