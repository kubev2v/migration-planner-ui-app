import type {
  ActiveEnvironmentsInputEnvironmentsEnum,
  AriaAutomationInputFeaturesEnum,
  AriaOpsInputFeaturesEnum,
  AriaSecureInputFeaturesEnum,
  DeployedEnvironmentInputEnvironmentEnum,
  NsxInputFeaturesEnum,
  VMwareSubscriptionInputLevelEnum,
} from "@openshift-migration-advisor/planner-sdk";

export interface LabeledOption<T extends string> {
  value: T;
  label: string;
}

/** Editable manual-environment form. Empty counts use "" so inputs can stay blank. */
export interface ManualEnvironmentFormValues {
  deployedEnvironment: DeployedEnvironmentInputEnvironmentEnum | "";
  perpetualLicensesCount: number | "";
  coresLicensingCount: number | "";
  environmentCount: number | "";
  otherNodesCount: number | "";
  activeEnvironments: ActiveEnvironmentsInputEnvironmentsEnum[];
  subscriptionLevels: VMwareSubscriptionInputLevelEnum[];
  vmEncryptionEnabled: boolean;
  srmEnabled: boolean;
  /**
   * Kept so a save does not wipe a policy already stored by the API.
   * The wizard does not show this field.
   */
  vmEncryptionPolicy: string;
  nsxFeatures: NsxInputFeaturesEnum[];
  ariaOpsFeatures: AriaOpsInputFeaturesEnum[];
  ariaAutomationFeatures: AriaAutomationInputFeaturesEnum[];
  ariaSecureFeatures: AriaSecureInputFeaturesEnum[];
  physicalLocationsCount: number | "";
  targetHardware: string;
}

export interface SummaryField {
  label: string;
  value: string;
}

export interface ManualEnvironmentSummary {
  vmware: SummaryField[];
  vsphere: SummaryField[];
  nsx: SummaryField[];
  customer: SummaryField[];
}
