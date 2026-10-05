import {
  ActiveEnvironmentsInputEnvironmentsEnum,
  AriaAutomationInputFeaturesEnum,
  AriaOpsInputFeaturesEnum,
  AriaSecureInputFeaturesEnum,
  DeployedEnvironmentInputEnvironmentEnum,
  NsxInputFeaturesEnum,
  VMwareSubscriptionInputLevelEnum,
} from "@openshift-migration-advisor/planner-sdk";

import type { LabeledOption } from "./types";

export const NOT_PROVIDED = "Not provided";

export const FIELD_LABELS = {
  deployedEnvironment: "Deployed environment",
  perpetualLicenses: "Number of perpetual licenses",
  coresLicensing: "Number of cores licensing",
  environments: "Number of environments",
  otherNodes: "Number of other nodes",
  activeEnvironments: "Active environments",
  subscriptionLevel: "VMware subscription level",
  vmEncryption: "VM encryption",
  siteRecoveryManager: "Site Recovery Manager",
  nsxFeatures: "NSX features",
  ariaOpsFeatures: "Aria Operations features",
  ariaAutomationFeatures: "Aria Automation features",
  ariaSecureFeatures: "Aria Secure features",
  physicalLocations: "Number of physical locations/datacenters",
  targetHardware: "Target hardware framework",
} as const;

export const SELECT_PLACEHOLDERS = {
  deployedEnvironment: "Select deployed environment",
  activeEnvironments: "Select active environments",
  subscriptionLevels: "Select subscription levels",
  nsxFeatures: "Select NSX features",
  ariaOpsFeatures: "Select Aria Operations features",
  ariaAutomationFeatures: "Select Aria Automation features",
  ariaSecureFeatures: "Select Aria Secure features",
} as const;

const NOT_ASSESSED = "Not assessed";
const NOT_AVAILABLE = "Not available";
const NOT_IN_USE = "Not in use";

export const DEPLOYED_ENVIRONMENT_OPTIONS: readonly LabeledOption<DeployedEnvironmentInputEnvironmentEnum>[] =
  [
    {
      value: DeployedEnvironmentInputEnvironmentEnum.OnPremises,
      label: "On-premises",
    },
    {
      value: DeployedEnvironmentInputEnvironmentEnum.OnCloud,
      label: "On cloud",
    },
    {
      value: DeployedEnvironmentInputEnvironmentEnum.ManagedServices,
      label: "Managed services",
    },
    {
      value: DeployedEnvironmentInputEnvironmentEnum.NotAssessed,
      label: NOT_ASSESSED,
    },
  ];

export const ACTIVE_ENVIRONMENT_OPTIONS: readonly LabeledOption<ActiveEnvironmentsInputEnvironmentsEnum>[] =
  [
    {
      value: ActiveEnvironmentsInputEnvironmentsEnum.Production,
      label: "Production",
    },
    { value: ActiveEnvironmentsInputEnvironmentsEnum.Qa, label: "QA" },
    { value: ActiveEnvironmentsInputEnvironmentsEnum.Dev, label: "Dev" },
    { value: ActiveEnvironmentsInputEnvironmentsEnum.Other, label: "Other" },
    {
      value: ActiveEnvironmentsInputEnvironmentsEnum.NotAssessed,
      label: NOT_ASSESSED,
    },
  ];

export const SUBSCRIPTION_LEVEL_OPTIONS: readonly LabeledOption<VMwareSubscriptionInputLevelEnum>[] =
  [
    { value: VMwareSubscriptionInputLevelEnum.Vcf, label: "VCF" },
    { value: VMwareSubscriptionInputLevelEnum.Vvf, label: "VVF" },
    { value: VMwareSubscriptionInputLevelEnum.Vvs, label: "VVS" },
    { value: VMwareSubscriptionInputLevelEnum.Vvep, label: "VVEP" },
    { value: VMwareSubscriptionInputLevelEnum.Vsphere, label: "vSphere" },
    {
      value: VMwareSubscriptionInputLevelEnum.NotAssessed,
      label: NOT_ASSESSED,
    },
  ];

export const NSX_FEATURE_OPTIONS: readonly LabeledOption<NsxInputFeaturesEnum>[] =
  [
    {
      value: NsxInputFeaturesEnum.Microsegmentation,
      label: "Microsegmentation",
    },
    { value: NsxInputFeaturesEnum.MultiCloud, label: "Multi-cloud" },
    { value: NsxInputFeaturesEnum.Tunnels, label: "Tunnels" },
    { value: NsxInputFeaturesEnum.DynamicRouting, label: "Dynamic routing" },
    { value: NsxInputFeaturesEnum.CentralMgmt, label: "Central management" },
    { value: NsxInputFeaturesEnum.Mpls, label: "MPLS" },
    { value: NsxInputFeaturesEnum.Qos, label: "QoS" },
    { value: NsxInputFeaturesEnum.NotAssessed, label: NOT_ASSESSED },
    { value: NsxInputFeaturesEnum.NotAvailable, label: NOT_AVAILABLE },
    { value: NsxInputFeaturesEnum.NotInUse, label: NOT_IN_USE },
  ];

export const ARIA_OPS_FEATURE_OPTIONS: readonly LabeledOption<AriaOpsInputFeaturesEnum>[] =
  [
    {
      value: AriaOpsInputFeaturesEnum.PerformanceAnalytics,
      label: "Performance analytics",
    },
    { value: AriaOpsInputFeaturesEnum.HealthScore, label: "Health score" },
    { value: AriaOpsInputFeaturesEnum.Alerting, label: "Alerting" },
    { value: AriaOpsInputFeaturesEnum.LogInsight, label: "Log Insight" },
    {
      value: AriaOpsInputFeaturesEnum.ItsmIntegration,
      label: "ITSM integration",
    },
    { value: AriaOpsInputFeaturesEnum.Rightsizing, label: "Rightsizing" },
    {
      value: AriaOpsInputFeaturesEnum.AutoOptimization,
      label: "Auto optimization",
    },
    {
      value: AriaOpsInputFeaturesEnum.TrueVisibility,
      label: "True visibility",
    },
    {
      value: AriaOpsInputFeaturesEnum.CapacityPlanning,
      label: "Capacity planning",
    },
    {
      value: AriaOpsInputFeaturesEnum.AnomalyDetection,
      label: "Anomaly detection",
    },
    { value: AriaOpsInputFeaturesEnum.NotAssessed, label: NOT_ASSESSED },
    { value: AriaOpsInputFeaturesEnum.NotAvailable, label: NOT_AVAILABLE },
    { value: AriaOpsInputFeaturesEnum.NotInUse, label: NOT_IN_USE },
  ];

export const ARIA_AUTOMATION_FEATURE_OPTIONS: readonly LabeledOption<AriaAutomationInputFeaturesEnum>[] =
  [
    {
      value: AriaAutomationInputFeaturesEnum.InfraProvisioning,
      label: "Infrastructure provisioning",
    },
    {
      value: AriaAutomationInputFeaturesEnum.CloudAssembly,
      label: "Cloud Assembly",
    },
    {
      value: AriaAutomationInputFeaturesEnum.ServiceCatalog,
      label: "Service catalog",
    },
    { value: AriaAutomationInputFeaturesEnum.Blueprints, label: "Blueprints" },
    {
      value: AriaAutomationInputFeaturesEnum.ConfigMgmt,
      label: "Configuration management",
    },
    { value: AriaAutomationInputFeaturesEnum.Hcx, label: "HCX" },
    {
      value: AriaAutomationInputFeaturesEnum.Orchestrator,
      label: "Orchestrator",
    },
    { value: AriaAutomationInputFeaturesEnum.Terraform, label: "Terraform" },
    { value: AriaAutomationInputFeaturesEnum.Dsm, label: "DSM" },
    {
      value: AriaAutomationInputFeaturesEnum.TanzuK8s,
      label: "Tanzu Kubernetes",
    },
    {
      value: AriaAutomationInputFeaturesEnum.TanzuApp,
      label: "Tanzu Application",
    },
    {
      value: AriaAutomationInputFeaturesEnum.K8sNamespaces,
      label: "Kubernetes namespaces",
    },
    { value: AriaAutomationInputFeaturesEnum.NotAssessed, label: NOT_ASSESSED },
    {
      value: AriaAutomationInputFeaturesEnum.NotAvailable,
      label: NOT_AVAILABLE,
    },
    { value: AriaAutomationInputFeaturesEnum.NotInUse, label: NOT_IN_USE },
  ];

export const ARIA_SECURE_FEATURE_OPTIONS: readonly LabeledOption<AriaSecureInputFeaturesEnum>[] =
  [
    {
      value: AriaSecureInputFeaturesEnum.PolicyGovernance,
      label: "Policy governance",
    },
    {
      value: AriaSecureInputFeaturesEnum.ComplianceMonitoring,
      label: "Compliance monitoring",
    },
    { value: AriaSecureInputFeaturesEnum.NotAssessed, label: NOT_ASSESSED },
    { value: AriaSecureInputFeaturesEnum.NotAvailable, label: NOT_AVAILABLE },
    { value: AriaSecureInputFeaturesEnum.NotInUse, label: NOT_IN_USE },
  ];

export const WIZARD_STEPS = [
  { id: "vmware", name: "VMware environment" },
  { id: "vsphere", name: "vSphere core" },
  { id: "nsx", name: "NSX & Aria" },
  { id: "customer", name: "Customer & target" },
] as const;

export const WIZARD_TITLE = "Add manual environment details";
export const WIZARD_DESCRIPTION =
  "Provide details about your VMware environment that cannot be discovered automatically.";
export const DETAILS_HEADING = "Manual environment details";
export const DETAILS_DESCRIPTION =
  "Provide manual details about your VMware environment that cannot be discovered automatically.";
export const EMPTY_TITLE = "No manual environment details yet";
export const EMPTY_BODY =
  "Add licensing, VMware stack features, target hardware, and third-party tooling details to build a more complete migration assessment.";
