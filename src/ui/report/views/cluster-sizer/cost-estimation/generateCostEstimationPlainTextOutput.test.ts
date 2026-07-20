import { describe, expect, it } from "vitest";

import type { CostEstimationResponse } from "../../../../../models/CostEstimationModel";
import { generateCostEstimationPlainTextOutput } from "./generateCostEstimationPlainTextOutput";

describe("generateCostEstimationPlainTextOutput", () => {
  it("should produce the expected plain text output", () => {
    const costEstimation: CostEstimationResponse = {
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
      vmware: {
        VMwareSolution: "vmwareVcf",
        totalThreeYearCostEstimation: 1267200,
        breakdown: {
          softwareSubscriptions: 1267200,
          ansibleAutomationPlatform: 0,
          migrationConsultingServices: 0,
          swingHardwareUpgrades: 0,
          additionalStorageCosts: 0,
          thirdPartyIsvCosts: 0,
        },
      },
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
      savings: {
        absoluteThreeYearUsd: 49855,
        percentage: 4,
      },
    };

    expect(generateCostEstimationPlainTextOutput(costEstimation)).toBe(
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

  it("should produce output without savings when savings is null", () => {
    const costEstimation: CostEstimationResponse = {
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
      vmware: {
        VMwareSolution: "vmwareVvf",
        totalThreeYearCostEstimation: 601920,
        breakdown: {
          softwareSubscriptions: 601920,
          ansibleAutomationPlatform: 0,
          migrationConsultingServices: 0,
          swingHardwareUpgrades: 0,
          additionalStorageCosts: 0,
          thirdPartyIsvCosts: 0,
        },
      },
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
      savings: null,
    };

    const output = generateCostEstimationPlainTextOutput(costEstimation);
    expect(output).not.toContain("Savings Summary");
  });
});
