// ---------------------------------------------------------------------------
// Cost Estimation types
// ---------------------------------------------------------------------------

// Form
export type RhEdition = "OVE" | "OKE" | "OCP" | "OPP";

export interface CostEstimationFormValues {
  // VMware Solution Scope
  vcfDiscountPct: number; // 0-100
  vvfDiscountPct: number; // 0-100
  vvsDiscountPct: number; // 0-100
  consolidationPct: number; // 0-100 (default 10)

  // Red Hat Solution Scope
  rhEdition: RhEdition;
  includeACM: boolean;
  redhatDiscountPct: number; // 0-100
  aapDiscountPct: number; // 0-100
}

export interface ACMConfig {
  label: string;
  disabled: boolean;
  checked: boolean;
}

// Payload
export type Discounts = {
  vcfDiscountPct: number;
  vvfDiscountPct: number;
  vvsDiscountPct: number;
  redhatDiscountPct: number;
  aapDiscountPct: number;
};

export type CalculateCostEstimationRequest = {
  assessmentId: string;
  clusterId: string;
  rhEdition: RhEdition;
  includeACM: boolean;
  consolidationPct: number;
  discounts: Discounts;
};

// Result
export type CostEstimationBreakdown = {
  softwareSubscriptions: number;
  ansibleAutomationPlatform: number;
  migrationConsultingServices: number;
  swingHardwareUpgrades: number;
  additionalStorageCosts: number;
  thirdPartyIsvCosts: number;
};

export type CostEstimationScenario = {
  totalThreeYearCostEstimation: number;
  breakdown: CostEstimationBreakdown;
};

export type SavingsVsReference = {
  absoluteThreeYearUsd: number;
  percentage: number;
};

export type CostEstimateSavings = {
  vsVcf?: SavingsVsReference;
  vsVvf?: SavingsVsReference;
};

export type CostEstimateResults = {
  vmwareVcf: CostEstimationScenario;
  vmwareVvf: CostEstimationScenario;
  openshiftVirtualization: CostEstimationScenario;
};

export type CustomerEnvironment = {
  coresPerSocket: number;
  socketsPerHost: number;
  totalEsxiHosts: number;
  totalVirtualMachines: number;
};

export type CostEstimationResponse = {
  calculatorVersion: string;
  customerEnvironment: CustomerEnvironment;
  results: CostEstimateResults;
  savings: CostEstimateSavings;
};
