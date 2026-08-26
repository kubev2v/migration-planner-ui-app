import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CheckboxFormGroup,
  SelectFormGroup,
  TextInputFormGroup,
} from "@openshift-migration-advisor/shared-components";
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import type {
  ACMConfig,
  CostEstimationFormValues,
} from "../../../../../models/CostEstimationModel";
import { costEstimationValidationSchema } from "./validation";

const styles = {
  form: css`
    gap: var(--pf-t--global--spacer--sm);
  `,
  formGroupCheckbox: css`
    margin-top: 0.5em;
  `,
};

const DEFAULT_COST_ESTIMATION_FORM_VALUES: CostEstimationFormValues = {
  vmwareSolution: "vmwareVcf",
  vmwareDiscount: 0,
  rhEdition: "OVE",
  includeACM: true,
  openshiftDiscount: 0,
  withAap: false,
  aapDiscount: 0,
  additionalStorageCost: 0,
  thirdPartyISVCost: 0,
  swingHardwareCost: 0,
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
  const withAap = useWatch({ control: methods.control, name: "withAap" });

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
        <FormSection title="VMware solution scope">
          <Grid hasGutter md={4}>
            <GridItem>
              <SelectFormGroup
                id="vmwareSolution"
                name="vmwareSolution"
                label="VMware solution"
                options={[
                  {
                    value: "vmwareVcf",
                    label: "VMware Cloud Foundation (VCF)",
                  },
                  {
                    value: "vmwareVvf",
                    label: "VMware vSphere Foundation (VVF)",
                  },
                  {
                    value: "vmwareVvs",
                    label: "VMware vSphere Standard (VVS)",
                  },
                ]}
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="vmwareDiscount"
                name="vmwareDiscount"
                label="Assumed discount (%)"
                type="number"
              />
            </GridItem>
          </Grid>
        </FormSection>
        <FormSection title="Red Hat solution scope">
          <Grid hasGutter md={4}>
            <GridItem>
              <SelectFormGroup
                id="rhEdition"
                name="rhEdition"
                label="OpenShift edition"
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
              <FormGroup
                fieldId="includeACM"
                className={styles.formGroupCheckbox}
              >
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
                id="openshiftDiscount"
                name="openshiftDiscount"
                label="Assumed Red Hat discount (%)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="aapDiscount"
                name="aapDiscount"
                label="Assumed AAP discount (%)"
                type="number"
                isDisabled={!withAap}
              />
              <CheckboxFormGroup
                id="withAap"
                name="withAap"
                label="Include Ansible Automation Platform (AAP)"
                className={styles.formGroupCheckbox}
              />
            </GridItem>
          </Grid>
        </FormSection>
        <FormSection title="Cost & infrastructure assumptions">
          <Grid hasGutter md={6}>
            <GridItem>
              <TextInputFormGroup
                id="additionalStorageCost"
                name="additionalStorageCost"
                label="Annual storage cost ($)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="thirdPartyISVCost"
                name="thirdPartyISVCost"
                label="Annual 3rd party ISV cost ($)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="swingHardwareCost"
                name="swingHardwareCost"
                label="Swing hardware cost ($)"
                type="number"
                helpText="Net Cost per New Server minus residual recovery value"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="consolidationPct"
                name="consolidationPct"
                label="VMs retired/moved to cloud (%)"
                type="number"
                helpText="Percentage of VMs that will be decommissioned or moved to cloud"
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
