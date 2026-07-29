// ---------------------------------------------------------------------------
// Cost Estimation types
// ---------------------------------------------------------------------------

// Enums / unions
export type RhEdition = "OVE" | "OKE" | "OCP" | "OPP";
export type VMwareSolutionName = "vmwareVcf" | "vmwareVvf" | "vmwareVvs";

// Form
export interface CostEstimationFormValues {
  // VMware Solution Scope
  vmwareSolution: VMwareSolutionName;
  vmwareDiscount: number; // 0-100

  // Red Hat Solution Scope
  rhEdition: RhEdition;
  includeACM: boolean;
  openshiftDiscount: number; // 0-100
  withAap: boolean;
  aapDiscount: number; // 0-100

  // Cost & infrastructure assumptions
  additionalStorageCost: number; // >= 0, USD
  thirdPartyISVCost: number; // >= 0, USD
  swingHardwareCost: number; // >= 0, USD
  consolidationPct: number; // 0-100 (default 10)
}

export interface ACMConfig {
  label: string;
  disabled: boolean;
  checked: boolean;
}

// Request payload
export type VMwareSolutionInput = {
  name: VMwareSolutionName;
  discount: number;
};

export type RHEditionInput = {
  name: RhEdition;
  includeACM?: boolean;
  openshiftDiscount?: number;
  withAap?: boolean;
  aapDiscount?: number;
  thirdPartyISVCost?: number;
  additionalStorageCost?: number;
  swingHardwareCost?: number;
};

export type CalculateCostEstimationRequest = {
  assessmentId: string;
  clusterId?: string;
  scope?: "cluster" | "assessment";
  vmwareSolution: VMwareSolutionInput;
  rhEdition: RHEditionInput;
  consolidationPct?: number;
};

// Response
export type CostEstimationBreakdown = {
  softwareSubscriptions: number;
  ansibleAutomationPlatform: number;
  migrationConsultingServices: number;
  swingHardwareUpgrades: number;
  additionalStorageCosts: number;
  thirdPartyIsvCosts: number;
};

export type RedhatResult = {
  rhEdition: RhEdition | { name: RhEdition };
  breakdown: CostEstimationBreakdown;
  totalThreeYearCostEstimation: number;
};

export type VmwareResult = {
  vmwareSolution: VMwareSolutionName | { name: VMwareSolutionName };
  breakdown: CostEstimationBreakdown;
  totalThreeYearCostEstimation: number;
};

export type SavingsVsReference = {
  absoluteThreeYearUsd: number;
  percentage: number;
};

export type CustomerEnvironment = {
  coresPerSocket: number;
  socketsPerHost: number;
  totalEsxiHosts: number;
  totalVirtualMachines: number;
};

export type TargetEnvironment = {
  targetHosts: number;
  targetVMs: number;
  consolidationPct: number;
  effectiveCoresPerSocket: number;
  totalLicensedCores: number;
  rhSubsRequired: number;
};

export type BaselineDerivation = {
  licensedCores: number;
  unitPricePerCore: number;
  discountPct: number;
  threeYearCostUsd: number;
};

export type CostEstimationAssumptions = {
  analysisYears: number;
  totalEsxiHosts: number;
  socketsPerHost: number;
  effectiveCoresPerSocket: number;
  totalLicensedCores: number;
  vmwareBaseline: BaselineDerivation;
};

export type CostEstimationResponse = {
  calculatorVersion: string;
  customerEnvironment: CustomerEnvironment;
  targetEnvironment: TargetEnvironment;
  redhat: RedhatResult;
  vmware: VmwareResult;
  savings: SavingsVsReference | null;
  assumptions?: CostEstimationAssumptions;
};
