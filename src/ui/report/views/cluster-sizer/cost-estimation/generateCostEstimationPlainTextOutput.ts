import type {
  CostEstimationResponse,
  RhEdition,
  VMwareSolutionName,
} from "../../../../../models/CostEstimationModel";

const LABEL_WIDTH = 34;
const COL_WIDTH = 14;

const VMWARE_SOLUTION_FULL_NAMES: Record<VMwareSolutionName, string> = {
  vmwareVcf: "VMware Cloud Foundation (VCF)",
  vmwareVvf: "VMware vSphere Foundation (VVF)",
  vmwareVvs: "VMware vSphere Standard (VVS)",
};

const VMWARE_SOLUTION_SHORT_NAMES: Record<VMwareSolutionName, string> = {
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

function formatUsd(value: number): string {
  if (value === 0) return "-";
  const sign = value < 0 ? "-" : "";
  const str = Math.abs(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${str}`;
}

function row(label: string, a: number, b: number): string {
  return `  ${label.padEnd(LABEL_WIDTH)}${formatUsd(a).padStart(COL_WIDTH)}${formatUsd(b).padStart(COL_WIDTH)}`;
}

export function generateCostEstimationPlainTextOutput(
  costEstimation: CostEstimationResponse,
): string {
  const { customerEnvironment: env, vmware, redhat, savings } = costEstimation;
  const vmw = vmware.breakdown;
  const rh = redhat.breakdown;

  const vmwareShort = VMWARE_SOLUTION_SHORT_NAMES[vmware.VMwareSolution];
  const vmwareFull = VMWARE_SOLUTION_FULL_NAMES[vmware.VMwareSolution];

  const header = `  ${"".padEnd(LABEL_WIDTH)}${vmwareShort.padStart(COL_WIDTH)}${"Red Hat".padStart(COL_WIDTH)}`;
  const separator = `  ${"-".repeat(LABEL_WIDTH + COL_WIDTH * 2)}`;

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
    `  ${vmwareFull}: ${formatUsd(vmware.totalThreeYearCostEstimation)}`,
    `  ${RH_EDITION_FULL_NAMES[redhat.rhEdition]}: ${formatUsd(redhat.totalThreeYearCostEstimation)}`,
    "",
    "Detailed 3-Year Breakdown",
    "",
    header,
    row(
      "Software Subscriptions",
      vmw.softwareSubscriptions,
      rh.softwareSubscriptions,
    ),
    row(
      "Ansible Automation Platform",
      vmw.ansibleAutomationPlatform,
      rh.ansibleAutomationPlatform,
    ),
    row(
      "Migration Consulting Services",
      vmw.migrationConsultingServices,
      rh.migrationConsultingServices,
    ),
    row(
      "Swing Hardware Upgrades",
      vmw.swingHardwareUpgrades,
      rh.swingHardwareUpgrades,
    ),
    row(
      "Additional Storage Costs",
      vmw.additionalStorageCosts,
      rh.additionalStorageCosts,
    ),
    row("Third-party ISV Costs", vmw.thirdPartyIsvCosts, rh.thirdPartyIsvCosts),
    separator,
    row(
      "TOTAL 3-YEAR TCO",
      vmware.totalThreeYearCostEstimation,
      redhat.totalThreeYearCostEstimation,
    ),
  ];

  if (savings) {
    lines.push("");
    lines.push("Savings Summary");
    lines.push(
      `  Savings vs ${vmwareFull}: ${formatUsd(savings.absoluteThreeYearUsd)} (${savings.percentage.toFixed(1)}%)`,
    );
  }

  return lines.join("\n");
}
