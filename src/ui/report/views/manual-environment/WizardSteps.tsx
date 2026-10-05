import { FormGroup, Stack, StackItem, TextInput } from "@patternfly/react-core";
import React from "react";

import {
  ACTIVE_ENVIRONMENT_OPTIONS,
  ARIA_AUTOMATION_FEATURE_OPTIONS,
  ARIA_OPS_FEATURE_OPTIONS,
  ARIA_SECURE_FEATURE_OPTIONS,
  DEPLOYED_ENVIRONMENT_OPTIONS,
  FIELD_LABELS,
  NSX_FEATURE_OPTIONS,
  SELECT_PLACEHOLDERS,
  SUBSCRIPTION_LEVEL_OPTIONS,
} from "../../manual-environment/constants";
import type { ManualEnvironmentFormValues } from "../../manual-environment/types";
import { CountField, OptionSelect, YesNoField } from "./FormControls";
import { fullWidthField, wizardFields } from "./styles";

export interface ManualEnvironmentStepProps {
  form: ManualEnvironmentFormValues;
  onChange: (patch: Partial<ManualEnvironmentFormValues>) => void;
}

export const VmwareEnvironmentStep: React.FC<ManualEnvironmentStepProps> = ({
  form,
  onChange,
}) => (
  <Stack hasGutter className={wizardFields}>
    <StackItem>
      <OptionSelect
        id="deployed-environment"
        label={FIELD_LABELS.deployedEnvironment}
        placeholder={SELECT_PLACEHOLDERS.deployedEnvironment}
        options={DEPLOYED_ENVIRONMENT_OPTIONS}
        value={form.deployedEnvironment}
        onChange={(deployedEnvironment) => {
          onChange({ deployedEnvironment });
        }}
      />
    </StackItem>
    <StackItem>
      <CountField
        id="perpetual-licenses"
        label={FIELD_LABELS.perpetualLicenses}
        value={form.perpetualLicensesCount}
        onChange={(perpetualLicensesCount) => {
          onChange({ perpetualLicensesCount });
        }}
      />
    </StackItem>
    <StackItem>
      <CountField
        id="cores-licensing"
        label={FIELD_LABELS.coresLicensing}
        value={form.coresLicensingCount}
        onChange={(coresLicensingCount) => {
          onChange({ coresLicensingCount });
        }}
      />
    </StackItem>
    <StackItem>
      <CountField
        id="environment-count"
        label={FIELD_LABELS.environments}
        value={form.environmentCount}
        onChange={(environmentCount) => {
          onChange({ environmentCount });
        }}
      />
    </StackItem>
    <StackItem>
      <CountField
        id="other-nodes"
        label={FIELD_LABELS.otherNodes}
        value={form.otherNodesCount}
        onChange={(otherNodesCount) => {
          onChange({ otherNodesCount });
        }}
      />
    </StackItem>
    <StackItem>
      <OptionSelect
        isMulti
        id="active-environments"
        label={FIELD_LABELS.activeEnvironments}
        placeholder={SELECT_PLACEHOLDERS.activeEnvironments}
        options={ACTIVE_ENVIRONMENT_OPTIONS}
        value={form.activeEnvironments}
        onChange={(activeEnvironments) => {
          onChange({ activeEnvironments });
        }}
      />
    </StackItem>
    <StackItem>
      <OptionSelect
        isMulti
        id="subscription-levels"
        label={FIELD_LABELS.subscriptionLevel}
        placeholder={SELECT_PLACEHOLDERS.subscriptionLevels}
        options={SUBSCRIPTION_LEVEL_OPTIONS}
        value={form.subscriptionLevels}
        onChange={(subscriptionLevels) => {
          onChange({ subscriptionLevels });
        }}
      />
    </StackItem>
  </Stack>
);

VmwareEnvironmentStep.displayName = "VmwareEnvironmentStep";

export const VsphereCoreStep: React.FC<ManualEnvironmentStepProps> = ({
  form,
  onChange,
}) => (
  <Stack hasGutter className={wizardFields}>
    <StackItem>
      <YesNoField
        id="vm-encryption"
        label={FIELD_LABELS.vmEncryption}
        value={form.vmEncryptionEnabled}
        onChange={(vmEncryptionEnabled) => {
          onChange({ vmEncryptionEnabled });
        }}
      />
    </StackItem>
    <StackItem>
      <YesNoField
        id="site-recovery-manager"
        label={FIELD_LABELS.siteRecoveryManager}
        value={form.srmEnabled}
        onChange={(srmEnabled) => {
          onChange({ srmEnabled });
        }}
      />
    </StackItem>
  </Stack>
);

VsphereCoreStep.displayName = "VsphereCoreStep";

export const NsxAriaStep: React.FC<ManualEnvironmentStepProps> = ({
  form,
  onChange,
}) => (
  <Stack hasGutter className={wizardFields}>
    <StackItem>
      <OptionSelect
        isMulti
        id="nsx-features"
        label={FIELD_LABELS.nsxFeatures}
        placeholder={SELECT_PLACEHOLDERS.nsxFeatures}
        options={NSX_FEATURE_OPTIONS}
        value={form.nsxFeatures}
        onChange={(nsxFeatures) => {
          onChange({ nsxFeatures });
        }}
      />
    </StackItem>
    <StackItem>
      <OptionSelect
        isMulti
        id="aria-ops-features"
        label={FIELD_LABELS.ariaOpsFeatures}
        placeholder={SELECT_PLACEHOLDERS.ariaOpsFeatures}
        options={ARIA_OPS_FEATURE_OPTIONS}
        value={form.ariaOpsFeatures}
        onChange={(ariaOpsFeatures) => {
          onChange({ ariaOpsFeatures });
        }}
      />
    </StackItem>
    <StackItem>
      <OptionSelect
        isMulti
        id="aria-automation-features"
        label={FIELD_LABELS.ariaAutomationFeatures}
        placeholder={SELECT_PLACEHOLDERS.ariaAutomationFeatures}
        options={ARIA_AUTOMATION_FEATURE_OPTIONS}
        value={form.ariaAutomationFeatures}
        onChange={(ariaAutomationFeatures) => {
          onChange({ ariaAutomationFeatures });
        }}
      />
    </StackItem>
    <StackItem>
      <OptionSelect
        isMulti
        id="aria-secure-features"
        label={FIELD_LABELS.ariaSecureFeatures}
        placeholder={SELECT_PLACEHOLDERS.ariaSecureFeatures}
        options={ARIA_SECURE_FEATURE_OPTIONS}
        value={form.ariaSecureFeatures}
        onChange={(ariaSecureFeatures) => {
          onChange({ ariaSecureFeatures });
        }}
      />
    </StackItem>
  </Stack>
);

NsxAriaStep.displayName = "NsxAriaStep";

export const CustomerTargetStep: React.FC<ManualEnvironmentStepProps> = ({
  form,
  onChange,
}) => (
  <Stack hasGutter className={wizardFields}>
    <StackItem>
      <CountField
        id="physical-locations"
        label={FIELD_LABELS.physicalLocations}
        value={form.physicalLocationsCount}
        onChange={(physicalLocationsCount) => {
          onChange({ physicalLocationsCount });
        }}
      />
    </StackItem>
    <StackItem>
      <FormGroup
        className={fullWidthField}
        label={FIELD_LABELS.targetHardware}
        fieldId="target-hardware"
      >
        <TextInput
          id="target-hardware"
          value={form.targetHardware}
          maxLength={1000}
          onChange={(_event, targetHardware) => {
            onChange({ targetHardware });
          }}
        />
      </FormGroup>
    </StackItem>
  </Stack>
);

CustomerTargetStep.displayName = "CustomerTargetStep";
