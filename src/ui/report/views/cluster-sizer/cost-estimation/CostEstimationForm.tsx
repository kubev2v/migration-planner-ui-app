import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
} from "@patternfly/react-core";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import type {
  ACMConfig,
  CostEstimationFormValues,
} from "../../../../../models/CostEstimationModel";
import {
  SelectFormGroup,
  TextInputFormGroup,
} from "../../../../core/components/form";
import { costEstimationValidationSchema } from "./validation";

const styles = {
  form: css`
    gap: var(--pf-t--global--spacer--sm);
  `,
  acmFormGroup: css`
    margin-top: -1em;
  `,
};

const DEFAULT_COST_ESTIMATION_FORM_VALUES: CostEstimationFormValues = {
  rhEdition: "OVE",
  includeACM: true,
  consolidationPct: 10,
};

export interface CostEstimationFormProps {
  isLoading?: boolean;
  onSubmit: (values: CostEstimationFormValues) => void;
}

export default function CostEstimationForm({
  isLoading = false,
  onSubmit,
}: CostEstimationFormProps) {
  const methods = useForm<CostEstimationFormValues>({
    resolver: yupResolver(costEstimationValidationSchema),
    mode: "onTouched",
    defaultValues: {
      ...DEFAULT_COST_ESTIMATION_FORM_VALUES,
    },
  });

  const handleSubmit = (data: CostEstimationFormValues) => {
    onSubmit(data);
  };

  // Watch values for dynamic behavior
  const rhEdition = useWatch({ control: methods.control, name: "rhEdition" });
  const includeACM = useWatch({ control: methods.control, name: "includeACM" });

  // Compute ACM checkbox configuration based on edition
  const acmConfig: ACMConfig = useMemo(() => {
    if (rhEdition === "OPP") {
      return {
        label: "ACM for Kubernetes (Included in OPP)",
        disabled: true,
        checked: true,
      };
    }
    if (rhEdition === "OVE") {
      return {
        label: "Include ACM for Virtualization Add-on",
        disabled: false,
        checked: includeACM,
      };
    }
    // OKE or OCP
    return {
      label: "Include ACM for Kubernetes Add-on",
      disabled: false,
      checked: includeACM,
    };
  }, [rhEdition, includeACM]);

  // Auto-check ACM when switching to OPP
  useEffect(() => {
    if (rhEdition === "OPP" && !includeACM) {
      methods.setValue("includeACM", true);
    }
  }, [rhEdition, includeACM, methods]);

  return (
    <FormProvider {...methods}>
      <Form
        id="cost-estimation-form"
        onSubmit={(e) => {
          void methods.handleSubmit(handleSubmit)(e);
        }}
        className={styles.form}
      >
        <FormSection title="Red Hat Solution Scope">
          <SelectFormGroup
            id="rhEdition"
            name="rhEdition"
            label="OpenShift Edition"
            isRequired
            options={[
              {
                value: "OVE",
                label: "OpenShift Virtualization Engine (OVE)",
              },
              {
                value: "OKE",
                label: "OpenShift Kubernetes Engine (OKE)",
              },
              {
                value: "OCP",
                label: "OpenShift Container Platform (OCP)",
              },
              { value: "OPP", label: "OpenShift Platform Plus (OPP)" },
            ]}
          />

          <FormGroup fieldId="includeACM" className={styles.acmFormGroup}>
            <Checkbox
              id="includeACM"
              label={acmConfig.label}
              isChecked={acmConfig.checked}
              isDisabled={acmConfig.disabled}
              onChange={(_, checked) => methods.setValue("includeACM", checked)}
            />
          </FormGroup>
        </FormSection>
        <FormSection title="Consolidation">
          <TextInputFormGroup
            id="consolidationPct"
            name="consolidationPct"
            label="VMs Retired/Moved to Cloud (%)"
            type="number"
            isRequired
            helpText="Percentage of VMs that will be decommissioned or moved to cloud"
          />
        </FormSection>
        <ActionGroup>
          <Button type="submit" variant="primary" isDisabled={isLoading}>
            Calculate
          </Button>
        </ActionGroup>
      </Form>
    </FormProvider>
  );
}
