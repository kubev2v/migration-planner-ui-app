import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { useEffect, useMemo, useState } from "react";
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
    margin-top: 0.5em;
  `,
};

const DEFAULT_COST_ESTIMATION_FORM_VALUES: CostEstimationFormValues = {
  vcfDiscountPct: 0,
  vvfDiscountPct: 0,
  vvsDiscountPct: 0,
  rhEdition: "OVE",
  includeACM: true,
  redhatDiscountPct: 0,
  aapDiscountPct: 0,
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

  const [vmwareSolution, setVmwareSolution] = useState("VCF");

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
        <FormSection title="VMware Solution Scope">
          <Grid hasGutter md={6}>
            <GridItem>
              <FormGroup label="VMware Solution" fieldId="vmwareSolution">
                <FormSelect
                  id="vmwareSolution"
                  value={vmwareSolution}
                  onChange={(_e, value) => setVmwareSolution(value)}
                >
                  <FormSelectOption
                    value="VCF"
                    label="VMware Cloud Foundation (VCF)"
                  />
                  <FormSelectOption
                    value="VVF"
                    label="VMware vSphere Foundation (VVF)"
                  />
                  <FormSelectOption
                    value="VVS"
                    label="VMware vSphere Standard (VVS)"
                  />
                </FormSelect>
              </FormGroup>
            </GridItem>
            <GridItem>
              {vmwareSolution === "VCF" && (
                <TextInputFormGroup
                  id="vcfDiscountPct"
                  name="vcfDiscountPct"
                  label="Assumed VCF Discount (%)"
                  type="number"
                  isRequired
                />
              )}
              {vmwareSolution === "VVF" && (
                <TextInputFormGroup
                  id="vvfDiscountPct"
                  name="vvfDiscountPct"
                  label="Assumed VVF Discount (%)"
                  type="number"
                  isRequired
                />
              )}
              {vmwareSolution === "VVS" && (
                <TextInputFormGroup
                  id="vvsDiscountPct"
                  name="vvsDiscountPct"
                  label="Assumed VVS Discount (%)"
                  type="number"
                  isRequired
                />
              )}
            </GridItem>
          </Grid>
          <Grid hasGutter md={6}>
            <TextInputFormGroup
              id="consolidationPct"
              name="consolidationPct"
              label="VMs Retired/Moved to Cloud (%)"
              type="number"
              isRequired
              helpText="Percentage of VMs that will be decommissioned or moved to cloud"
            />
          </Grid>
        </FormSection>
        <FormSection title="Red Hat Solution Scope">
          <Grid hasGutter md={4}>
            <GridItem>
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
                  onChange={(_, checked) =>
                    methods.setValue("includeACM", checked)
                  }
                />
              </FormGroup>
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="redhatDiscountPct"
                name="redhatDiscountPct"
                label="Assumed Red Hat Discount (%)"
                type="number"
                isRequired
              />
            </GridItem>

            <GridItem>
              <TextInputFormGroup
                id="aapDiscountPct"
                name="aapDiscountPct"
                label="Assumed AAP Discount (%)"
                type="number"
                isRequired
              />
            </GridItem>
          </Grid>
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
