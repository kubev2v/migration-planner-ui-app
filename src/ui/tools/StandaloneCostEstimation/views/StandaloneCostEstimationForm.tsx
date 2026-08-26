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
  Content,
  ContentVariants,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import type { StandaloneCostEstimationFormValues } from "../../../../models/StandaloneCostEstimationModel";
import { standaloneCostEstimationValidationSchema } from "./validation";

const styles = {
  form: css`
    gap: var(--pf-t--global--spacer--sm);
  `,
  formGroupCheckbox: css`
    margin-top: 0.5em;
  `,
};

const DEFAULT_VALUES: StandaloneCostEstimationFormValues = {
  customerName: "",
  hosts: 800,
  socketsPerHost: 2,
  coresPerSocket: 64,
  vms: 20000,
  consolidationPct: 10,
  rhEdition: "OVE",
  includeACM: true,
  withAap: false,
  swingHardwareCost: 0,
  additionalStorageCost: 0,
  thirdPartyISVCost: 0,
  showVcf: true,
  showVvf: true,
  showVvs: false,
  priceVcf: 400,
  priceVvf: 190,
  priceVvs: 50,
  priceOve: 3000,
  priceOke: 13200,
  priceOcp: 26400,
  priceOpp: 49500,
  priceAcmVirt: 2200,
  priceAcmK8s: 9900,
  serverCost: 18000,
  discountVcf: 0,
  discountVvf: 0,
  discountVvs: 0,
  discountRh: 0,
  overrideMigrationCost: false,
  migrationCostOverride: 0,
};

export interface StandaloneCostEstimationFormProps {
  isLoading?: boolean;
  onSubmit: (values: StandaloneCostEstimationFormValues) => void;
}

export default function StandaloneCostEstimationForm({
  isLoading = false,
  onSubmit,
}: StandaloneCostEstimationFormProps) {
  const methods = useForm<StandaloneCostEstimationFormValues>({
    resolver: yupResolver(standaloneCostEstimationValidationSchema),
    mode: "onTouched",
    defaultValues: { ...DEFAULT_VALUES },
  });

  const handleSubmit = (data: StandaloneCostEstimationFormValues) => {
    onSubmit(data);
  };

  const rhEdition = useWatch({ control: methods.control, name: "rhEdition" });
  const includeACM = useWatch({
    control: methods.control,
    name: "includeACM",
  });
  const overrideMigrationCost = useWatch({
    control: methods.control,
    name: "overrideMigrationCost",
  });

  const acmConfig = useMemo(() => {
    if (rhEdition === "OPP") {
      return {
        label: "ACM for Kubernetes (Included in OPP)",
        disabled: true,
        checked: true,
      };
    }
    if (rhEdition === "OVE") {
      return {
        label: "Include Advanced Cluster Management (ACM)",
        disabled: false,
        checked: includeACM,
      };
    }
    return {
      label: "Include Advanced Cluster Management (ACM)",
      disabled: false,
      checked: includeACM,
    };
  }, [rhEdition, includeACM]);

  useEffect(() => {
    if (rhEdition === "OPP" && !includeACM) {
      methods.setValue("includeACM", true);
    }
  }, [rhEdition, includeACM, methods]);

  return (
    <FormProvider {...methods}>
      <Form
        id="standalone-cost-estimation-form"
        onSubmit={(e) => {
          void methods.handleSubmit(handleSubmit)(e);
        }}
        className={styles.form}
      >
        <FormSection title="Customer">
          <TextInputFormGroup
            id="ce-customer"
            name="customerName"
            label="Customer name"
          />
        </FormSection>

        <FormSection title="Customer environment">
          <Grid hasGutter md={6}>
            <GridItem>
              <TextInputFormGroup
                id="ce-hosts"
                name="hosts"
                label="Total ESXi hosts"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-sockets"
                name="socketsPerHost"
                label="Sockets per host"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-cores"
                name="coresPerSocket"
                label="Cores per socket"
                type="number"
                helpText="Min 16 required by VMware licensing"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-vms"
                name="vms"
                label="Current total VMs"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-consolidation"
                name="consolidationPct"
                label="VMs retired / moved to cloud (%)"
                type="number"
              />
            </GridItem>
          </Grid>
        </FormSection>

        <FormSection title="Red Hat scope">
          <Grid hasGutter md={6}>
            <GridItem>
              <SelectFormGroup
                id="ce-edition"
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
            </GridItem>
          </Grid>
          <FormGroup fieldId="includeACM" className={styles.formGroupCheckbox}>
            <Checkbox
              id="includeACM"
              label={acmConfig.label}
              isChecked={acmConfig.checked}
              isDisabled={acmConfig.disabled}
              onChange={(_, checked) => methods.setValue("includeACM", checked)}
            />
          </FormGroup>
          <CheckboxFormGroup
            id="ce-aap"
            name="withAap"
            label="Include Ansible Automation Platform (AAP)"
            className={styles.formGroupCheckbox}
          />
        </FormSection>

        <FormSection title="VMware plans to compare">
          <CheckboxFormGroup
            id="ce-show-vcf"
            name="showVcf"
            label="VMware Cloud Foundation (VCF)"
            className={styles.formGroupCheckbox}
          />
          <CheckboxFormGroup
            id="ce-show-vvf"
            name="showVvf"
            label="VMware vSphere Foundation (VVF)"
            className={styles.formGroupCheckbox}
          />
          <CheckboxFormGroup
            id="ce-show-vvs"
            name="showVvs"
            label="VMware vSphere Standard (VVS)"
            className={styles.formGroupCheckbox}
          />
        </FormSection>

        <FormSection title="Unit pricing">
          <Grid hasGutter md={4}>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-vcf"
                name="priceVcf"
                label="VMware VCF (per core / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-vvf"
                name="priceVvf"
                label="VMware VVF (per core / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-vvs"
                name="priceVvs"
                label="VMware VVS (per core / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-ove"
                name="priceOve"
                label="Red Hat OVE (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-oke"
                name="priceOke"
                label="Red Hat OKE (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-ocp"
                name="priceOcp"
                label="Red Hat OCP (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-opp"
                name="priceOpp"
                label="Red Hat OPP (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-acm-virt"
                name="priceAcmVirt"
                label="ACM Virtualization (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-price-acm-k8s"
                name="priceAcmK8s"
                label="ACM Kubernetes (per sub / year)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-server-cost"
                name="serverCost"
                label="Server cost (per swing host)"
                type="number"
              />
            </GridItem>
          </Grid>
        </FormSection>

        <FormSection title="Discounts & overrides">
          <Grid hasGutter md={4}>
            <GridItem>
              <TextInputFormGroup
                id="ce-disc-vcf"
                name="discountVcf"
                label="Assumed VCF discount (%)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-disc-vvf"
                name="discountVvf"
                label="Assumed VVF discount (%)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-disc-vvs"
                name="discountVvs"
                label="Assumed VVS discount (%)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-disc-rh"
                name="discountRh"
                label="Assumed Red Hat discount (%)"
                type="number"
              />
            </GridItem>
          </Grid>
        </FormSection>

        <FormSection title="Cost assumptions">
          <Grid hasGutter md={6}>
            <GridItem>
              <TextInputFormGroup
                id="ce-swing-hw-cost"
                name="swingHardwareCost"
                label="Swing hardware cost ($)"
                type="number"
                helpText="Net Cost per New Server minus residual recovery value"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-storage-cost"
                name="additionalStorageCost"
                label="Annual storage cost ($)"
                type="number"
              />
            </GridItem>
            <GridItem>
              <TextInputFormGroup
                id="ce-isv-cost"
                name="thirdPartyISVCost"
                label="Annual 3rd party ISV cost ($)"
                type="number"
              />
            </GridItem>
          </Grid>
          <CheckboxFormGroup
            id="ce-mig-manual"
            name="overrideMigrationCost"
            label="Override migration cost"
            className={styles.formGroupCheckbox}
          />
          {overrideMigrationCost && (
            <TextInputFormGroup
              id="ce-mig-cost"
              name="migrationCostOverride"
              label="Migration cost override ($)"
              type="number"
            />
          )}
          {!overrideMigrationCost && (
            <Content component={ContentVariants.small}>
              Migration cost auto-calculated from target VMs
            </Content>
          )}
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
