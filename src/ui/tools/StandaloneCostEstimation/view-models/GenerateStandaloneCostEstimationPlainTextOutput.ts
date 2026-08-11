import type {
  RhEdition,
  StandaloneCostEstimateResponse,
  VMwarePlanName,
} from "../../../../models/StandaloneCostEstimationModel";

const LABEL_WIDTH = 34;
const COL_WIDTH = 14;

const VMWARE_PLAN_FULL_NAMES: Record<VMwarePlanName, string> = {
  vmwareVcf: "VMware Cloud Foundation (VCF)",
  vmwareVvf: "VMware vSphere Foundation (VVF)",
  vmwareVvs: "VMware vSphere Standard (VVS)",
};

const VMWARE_PLAN_SHORT_NAMES: Record<VMwarePlanName, string> = {
  vmwareVcf: "VMW VCF",
  vmwareVvf: "VMW VVF",
  vmwareVvs: "VMW VVS",
};

const RH_EDITION_FULL_NAMES: Record<RhEdition, string> = {
  OVE: "Red Hat OpenShift Virtualization Engine",
  OKE: "Red Hat OpenShift Kubernetes Engine",
  OCP: "Red Hat OpenShift Container Platform",
  OPP: "Red Hat OpenShift Platform Plus",
};

function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value) || value === 0) return "-";
  const sign = value < 0 ? "-" : "";
  const str = Math.abs(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${str}`;
}

function row(label: string, vmwareValues: number[], rhValue: number): string {
  const vmCols = vmwareValues
    .map((v) => formatUsd(v).padStart(COL_WIDTH))
    .join("");
  return `  ${label.padEnd(LABEL_WIDTH)}${vmCols}${formatUsd(rhValue).padStart(COL_WIDTH)}`;
}

export function GenerateStandaloneCostEstimationPlainTextOutput(
  data: StandaloneCostEstimateResponse,
): string {
  const { customerEnvironment: env, vmwareResults, redhat } = data;

  const rhEditionFull =
    RH_EDITION_FULL_NAMES[redhat.rhEdition] ?? "Red Hat OpenShift";

  const vmShortNames = vmwareResults.map(
    (vm) => VMWARE_PLAN_SHORT_NAMES[vm.vmwareSolution] ?? vm.vmwareSolution,
  );
  const vmFullNames = vmwareResults.map(
    (vm) => VMWARE_PLAN_FULL_NAMES[vm.vmwareSolution] ?? vm.vmwareSolution,
  );

  const headerCols = vmShortNames.map((n) => n.padStart(COL_WIDTH)).join("");
  const header = `  ${"".padEnd(LABEL_WIDTH)}${headerCols}${"Red Hat".padStart(COL_WIDTH)}`;
  const totalColWidth = LABEL_WIDTH + COL_WIDTH * (vmwareResults.length + 1);
  const separator = `  ${"-".repeat(totalColWidth)}`;

  const lines = [
    "Red Hat OpenShift TCO Estimate",
    "",
    "Customer Environment",
    `  Total ESXi Hosts: ${env.totalEsxiHosts}`,
    `  Sockets per Host: ${env.socketsPerHost}`,
    `  Cores per Socket: ${env.coresPerSocket}`,
    `  Total VMs: ${env.totalVirtualMachines}`,
    "",
    "3-Year Total Cost of Ownership Comparison",
    ...vmwareResults.map(
      (vm, i) =>
        `  ${vmFullNames[i]}: ${formatUsd(vm.totalThreeYearCostEstimation)}`,
    ),
    `  ${rhEditionFull}: ${formatUsd(redhat.totalThreeYearCostEstimation)}`,
    "",
    "Detailed 3-Year Breakdown",
    "",
    header,
    row(
      "Software Subscriptions",
      vmwareResults.map((vm) => vm.breakdown.softwareSubscriptions),
      redhat.breakdown.softwareSubscriptions,
    ),
    row(
      "Ansible Automation Platform",
      vmwareResults.map((vm) => vm.breakdown.ansibleAutomationPlatform),
      redhat.breakdown.ansibleAutomationPlatform,
    ),
    row(
      "Migration Consulting Services",
      vmwareResults.map((vm) => vm.breakdown.migrationConsultingServices),
      redhat.breakdown.migrationConsultingServices,
    ),
    row(
      "Swing Hardware Upgrades",
      vmwareResults.map((vm) => vm.breakdown.swingHardwareUpgrades),
      redhat.breakdown.swingHardwareUpgrades,
    ),
    row(
      "Additional Storage Costs",
      vmwareResults.map((vm) => vm.breakdown.additionalStorageCosts),
      redhat.breakdown.additionalStorageCosts,
    ),
    row(
      "Third-party ISV Costs",
      vmwareResults.map((vm) => vm.breakdown.thirdPartyIsvCosts),
      redhat.breakdown.thirdPartyIsvCosts,
    ),
    separator,
    row(
      "TOTAL 3-YEAR TCO",
      vmwareResults.map((vm) => vm.totalThreeYearCostEstimation),
      redhat.totalThreeYearCostEstimation,
    ),
  ];

  const savingsEntries = vmwareResults.filter(
    (vm) => vm.savingsVsRedhat !== null,
  );
  if (savingsEntries.length > 0) {
    lines.push("");
    lines.push("Savings Summary");
    for (const vm of savingsEntries) {
      const fullName =
        VMWARE_PLAN_FULL_NAMES[vm.vmwareSolution] ?? vm.vmwareSolution;
      lines.push(
        `  Savings vs ${fullName}: ${formatUsd(vm.savingsVsRedhat!.absoluteThreeYearUsd)} (${vm.savingsVsRedhat!.percentage.toFixed(1)}%)`,
      );
    }
  }

  return lines.join("\n");
}
