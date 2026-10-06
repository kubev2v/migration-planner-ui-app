import { FormFieldHelperText } from "@openshift-migration-advisor/shared-components";
import { FormGroup, Stack, StackItem, TextInput } from "@patternfly/react-core";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

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

export const VmwareEnvironmentStep: React.FC = () => {
  const { control } = useFormContext<ManualEnvironmentFormValues>();

  return (
    <Stack hasGutter className={wizardFields}>
      <StackItem>
        <Controller
          control={control}
          name="deployedEnvironment"
          render={({ field, fieldState }) => (
            <OptionSelect
              id="deployed-environment"
              label={FIELD_LABELS.deployedEnvironment}
              placeholder={SELECT_PLACEHOLDERS.deployedEnvironment}
              options={DEPLOYED_ENVIRONMENT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="perpetualLicensesCount"
          render={({ field, fieldState }) => (
            <CountField
              id="perpetual-licenses"
              label={FIELD_LABELS.perpetualLicenses}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="coresLicensingCount"
          render={({ field, fieldState }) => (
            <CountField
              id="cores-licensing"
              label={FIELD_LABELS.coresLicensing}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="environmentCount"
          render={({ field, fieldState }) => (
            <CountField
              id="environment-count"
              label={FIELD_LABELS.environments}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="otherNodesCount"
          render={({ field, fieldState }) => (
            <CountField
              id="other-nodes"
              label={FIELD_LABELS.otherNodes}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="activeEnvironments"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="active-environments"
              label={FIELD_LABELS.activeEnvironments}
              placeholder={SELECT_PLACEHOLDERS.activeEnvironments}
              options={ACTIVE_ENVIRONMENT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="subscriptionLevels"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="subscription-levels"
              label={FIELD_LABELS.subscriptionLevel}
              placeholder={SELECT_PLACEHOLDERS.subscriptionLevels}
              options={SUBSCRIPTION_LEVEL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
    </Stack>
  );
};

VmwareEnvironmentStep.displayName = "VmwareEnvironmentStep";

export const VsphereCoreStep: React.FC = () => {
  const { control } = useFormContext<ManualEnvironmentFormValues>();

  return (
    <Stack hasGutter className={wizardFields}>
      <StackItem>
        <Controller
          control={control}
          name="vmEncryptionEnabled"
          render={({ field }) => (
            <YesNoField
              id="vm-encryption"
              label={FIELD_LABELS.vmEncryption}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="srmEnabled"
          render={({ field }) => (
            <YesNoField
              id="site-recovery-manager"
              label={FIELD_LABELS.siteRecoveryManager}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </StackItem>
    </Stack>
  );
};

VsphereCoreStep.displayName = "VsphereCoreStep";

export const NsxAriaStep: React.FC = () => {
  const { control } = useFormContext<ManualEnvironmentFormValues>();

  return (
    <Stack hasGutter className={wizardFields}>
      <StackItem>
        <Controller
          control={control}
          name="nsxFeatures"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="nsx-features"
              label={FIELD_LABELS.nsxFeatures}
              placeholder={SELECT_PLACEHOLDERS.nsxFeatures}
              options={NSX_FEATURE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="ariaOpsFeatures"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="aria-ops-features"
              label={FIELD_LABELS.ariaOpsFeatures}
              placeholder={SELECT_PLACEHOLDERS.ariaOpsFeatures}
              options={ARIA_OPS_FEATURE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="ariaAutomationFeatures"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="aria-automation-features"
              label={FIELD_LABELS.ariaAutomationFeatures}
              placeholder={SELECT_PLACEHOLDERS.ariaAutomationFeatures}
              options={ARIA_AUTOMATION_FEATURE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="ariaSecureFeatures"
          render={({ field, fieldState }) => (
            <OptionSelect
              isMulti
              id="aria-secure-features"
              label={FIELD_LABELS.ariaSecureFeatures}
              placeholder={SELECT_PLACEHOLDERS.ariaSecureFeatures}
              options={ARIA_SECURE_FEATURE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
    </Stack>
  );
};

NsxAriaStep.displayName = "NsxAriaStep";

export const CustomerTargetStep: React.FC = () => {
  const { control } = useFormContext<ManualEnvironmentFormValues>();

  return (
    <Stack hasGutter className={wizardFields}>
      <StackItem>
        <Controller
          control={control}
          name="physicalLocationsCount"
          render={({ field, fieldState }) => (
            <CountField
              id="physical-locations"
              label={FIELD_LABELS.physicalLocations}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </StackItem>
      <StackItem>
        <Controller
          control={control}
          name="targetHardware"
          render={({ field, fieldState }) => (
            <FormGroup
              className={fullWidthField}
              label={FIELD_LABELS.targetHardware}
              fieldId="target-hardware"
            >
              <TextInput
                id="target-hardware"
                value={field.value}
                maxLength={1000}
                validated={fieldState.error ? "error" : "default"}
                onChange={(_event, targetHardware) => {
                  field.onChange(targetHardware);
                }}
                onBlur={field.onBlur}
              />
              <FormFieldHelperText errorMessage={fieldState.error?.message} />
            </FormGroup>
          )}
        />
      </StackItem>
    </Stack>
  );
};

CustomerTargetStep.displayName = "CustomerTargetStep";
