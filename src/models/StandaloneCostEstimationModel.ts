// ---------------------------------------------------------------------------
// Standalone Cost Estimation types (maps to /api/v1/cost-estimation-standalone)
// ---------------------------------------------------------------------------

export type RhEdition = "OVE" | "OKE" | "OCP" | "OPP";
export type VMwarePlanName = "vmwareVcf" | "vmwareVvf" | "vmwareVvs";

// Form values — flat shape matching the standalone UI
export interface StandaloneCostEstimationFormValues {
  // Customer
  customerName: string;

  // Customer environment
  hosts: number;
  socketsPerHost: number;
  coresPerSocket: number;
  vms: number;
  consolidationPct: number;

  // Red Hat scope
  rhEdition: RhEdition;
  includeACM: boolean;
  withAap: boolean;
  includeSwingHardware: boolean;
  includeAdditionalStorage: boolean;
  includeISV: boolean;

  // VMware plans to compare
  showVcf: boolean;
  showVvf: boolean;
  showVvs: boolean;

  // Unit pricing — VMware
  priceVcf: number;
  priceVvf: number;
  priceVvs: number;

  // Unit pricing — Red Hat
  priceOve: number;
  priceOke: number;
  priceOcp: number;
  priceOpp: number;
  priceAcmVirt: number;
  priceAcmK8s: number;
  serverCost: number;

  // Discounts & overrides
  discountVcf: number;
  discountVvf: number;
  discountVvs: number;
  discountRh: number;
  overrideMigrationCost: boolean;
  migrationCostOverride: number;
}

// --- Request payload (POST /api/v1/cost-estimation-standalone) ---

export interface StandaloneVMwarePlan {
  name: VMwarePlanName;
  discount?: number;
  unitPriceOverride?: number;
}

export interface StandaloneRHEditionInput {
  name?: RhEdition;
  includeACM?: boolean;
  openshiftDiscount?: number;
}

export interface UnitPricingOverrides {
  rhOvePerNode?: number;
  rhOkePerNode?: number;
  rhOcpPerNode?: number;
  rhOppPerNode?: number;
  rhAcmVirtPerNode?: number;
  rhAcmK8sPerNode?: number;
  aapPerVm?: number;
}

export interface StandaloneCostEstimateRequest {
  customerName?: string;
  hosts?: number;
  socketsPerHost?: number;
  coresPerSocket?: number;
  vms?: number;
  consolidationPct?: number;
  vmwarePlans?: StandaloneVMwarePlan[];
  rhEdition?: StandaloneRHEditionInput;
  withAap?: boolean;
  aapDiscount?: number;
  thirdPartyISVCost?: number;
  additionalStorageCost?: number;
  swingHardwareCost?: number;
  serverCost?: number;
  migrationCostOverride?: number;
  unitPricingOverrides?: UnitPricingOverrides;
}

// --- Response payload ---

export interface CustomerEnvironment {
  totalEsxiHosts: number;
  socketsPerHost: number;
  coresPerSocket: number;
  totalVirtualMachines: number;
}

export interface TargetEnvironment {
  targetHosts: number;
  targetVMs: number;
  consolidationPct: number;
  effectiveCoresPerSocket: number;
  totalLicensedCores: number;
  rhSubsRequired: number;
}

export interface CostEstimationBreakdown {
  softwareSubscriptions: number;
  ansibleAutomationPlatform: number;
  migrationConsultingServices: number;
  swingHardwareUpgrades: number;
  additionalStorageCosts: number;
  thirdPartyIsvCosts: number;
}

export interface SavingsVsReference {
  absoluteThreeYearUsd: number;
  percentage: number;
}

export interface StandaloneVmwareResult {
  vmwareSolution: VMwarePlanName;
  totalThreeYearCostEstimation: number;
  breakdown: CostEstimationBreakdown;
  savingsVsRedhat: SavingsVsReference | null;
  unitPricePerCore: number;
}

export interface StandaloneRedhatResult {
  rhEdition: RhEdition;
  breakdown: CostEstimationBreakdown;
  totalThreeYearCostEstimation: number;
}

export interface StandaloneUnitPricingSummary {
  rhNodePerNode?: number;
  rhAcmPerNode?: number;
  aapPerVm?: number;
}

export interface StandaloneAssumptions {
  migrationCostFormulaTier?: string;
  migrationCostUsd?: number;
  swingHosts?: number;
  swingHardwareCostUsd?: number;
  serverCostUsd?: number;
  unitPricing?: StandaloneUnitPricingSummary;
}

export interface StandaloneCostEstimateResponse {
  calculatorVersion: string;
  customerName?: string;
  customerEnvironment: CustomerEnvironment;
  targetEnvironment: TargetEnvironment;
  vmwareResults: StandaloneVmwareResult[];
  redhat: StandaloneRedhatResult;
  assumptions: StandaloneAssumptions;
}
