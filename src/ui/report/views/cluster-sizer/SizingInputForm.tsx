import { css } from "@emotion/css";
import {
  Checkbox,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextInput,
} from "@patternfly/react-core";
import React from "react";

import {
  CLUSTER_MODE_OPTIONS,
  CONTROL_PLANE_CPU_OPTIONS,
  CONTROL_PLANE_MEMORY_OPTIONS,
  CPU_OPTIONS,
  CPU_OVERCOMMIT_OPTIONS,
  MEMORY_OPTIONS,
  MEMORY_OVERCOMMIT_OPTIONS,
} from "./constants";
import PopoverIcon from "./PopoverIcon";
import type {
  ClusterMode,
  MemoryOvercommitRatio,
  OvercommitRatio,
  SizingFormValues,
} from "./types";

interface SizingInputFormProps {
  values: SizingFormValues;
  onChange: (values: SizingFormValues) => void;
}

const sectionHeaderStyle = css`
  font-size: var(--pf-t--global--font--size--body--lg);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  color: var(--pf-t--global--text--color--regular);
  margin-top: var(--pf-t--global--spacer--200);
  margin-bottom: var(--pf-t--global--spacer--100);
`;

const smtInputStyle = css`
  width: 80px;
`;

const sectionDividerStyle = css`
  border: none;
  border-top: 1px solid var(--pf-t--global--border--color--default);
  margin: var(--pf-t--global--spacer--100) 0;
`;

export const SizingInputForm: React.FC<SizingInputFormProps> = ({
  values,
  onChange,
}) => {
  const handleClusterModeChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    mode: string,
  ): void => {
    const clusterMode = mode as ClusterMode;
    onChange({
      ...values,
      clusterMode,
      scheduleOnControlPlane:
        clusterMode === "single-node" ? true : values.scheduleOnControlPlane,
    });
  };

  const handleControlPlaneChange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
  ): void => {
    onChange({ ...values, scheduleOnControlPlane: checked });
  };

  const handleSmtEnabledChange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
  ): void => {
    onChange({ ...values, smtEnabled: checked });
  };

  const handleSmtThreadsChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ): void => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue)) {
      onChange({ ...values, smtThreads: newValue });
    }
  };

  const handleCpuChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    cpu: string,
  ): void => {
    onChange({
      ...values,
      workerNodePreset: "custom",
      customCpu: parseInt(cpu, 10),
    });
  };

  const handleMemoryChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    memory: string,
  ): void => {
    onChange({
      ...values,
      workerNodePreset: "custom",
      customMemoryGb: parseInt(memory, 10),
    });
  };

  const handleCpuOvercommitChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    ratio: string,
  ): void => {
    onChange({
      ...values,
      cpuOvercommitRatio: parseInt(ratio, 10) as OvercommitRatio,
    });
  };

  const handleMemoryOvercommitChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    ratio: string,
  ): void => {
    onChange({
      ...values,
      memoryOvercommitRatio: parseInt(ratio, 10) as MemoryOvercommitRatio,
    });
  };

  const handleControlPlaneCpuChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    cpu: string,
  ): void => {
    onChange({ ...values, controlPlaneCpu: parseInt(cpu, 10) });
  };

  const handleControlPlaneMemoryChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    memory: string,
  ): void => {
    onChange({ ...values, controlPlaneMemoryGb: parseInt(memory, 10) });
  };

  const showWorkerNode =
    values.clusterMode === "full-ha" ||
    values.clusterMode === "hosted-control-plane";
  const showControlPlane =
    values.clusterMode === "full-ha" || values.clusterMode === "single-node";
  const showCheckboxes = values.clusterMode === "full-ha";

  return (
    <Form>
      <Grid hasGutter>
        {/* Cluster mode dropdown */}
        <GridItem span={6}>
          <FormGroup label="Cluster mode" isRequired fieldId="cluster-mode">
            <FormSelect
              id="cluster-mode"
              value={values.clusterMode}
              onChange={handleClusterModeChange}
              aria-label="Cluster mode"
            >
              {CLUSTER_MODE_OPTIONS.map((option) => (
                <FormSelectOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </FormSelect>
          </FormGroup>
        </GridItem>

        {/* Checkboxes for Full HA mode only */}
        {showCheckboxes && (
          <>
            <GridItem span={12}>
              <Checkbox
                isLabelWrapped
                id="control-plane-scheduling"
                label="Run workloads on control plane nodes"
                isChecked={values.scheduleOnControlPlane}
                onChange={handleControlPlaneChange}
              />
            </GridItem>

            <GridItem span={12}>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
              >
                <FlexItem>
                  <Checkbox
                    isLabelWrapped
                    id="smt-enabled"
                    label="Enable SMT/Hyperthreading"
                    isChecked={values.smtEnabled}
                    onChange={handleSmtEnabledChange}
                  />
                </FlexItem>
                <FlexItem>
                  <TextInput
                    id="smt-threads"
                    value={values.smtThreads}
                    onChange={handleSmtThreadsChange}
                    name="smt-threads"
                    aria-label="SMT threads"
                    isDisabled={!values.smtEnabled}
                    type="number"
                    className={smtInputStyle}
                  />
                </FlexItem>
              </Flex>
            </GridItem>
          </>
        )}

        {/* Worker node section - show for Full HA and HCP */}
        {showWorkerNode && (
          <>
            <GridItem span={12}>
              <hr className={sectionDividerStyle} />
            </GridItem>

            <GridItem span={12}>
              <div className={sectionHeaderStyle}>Worker node</div>
            </GridItem>

            <GridItem span={4}>
              <FormGroup
                label="Worker node CPU core"
                isRequired
                fieldId="worker-cpu"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="Worker node CPU cores"
                    bodyContent="The number of CPU cores allocated to each worker node. Choose based on your workload requirements."
                  />
                }
              >
                <FormSelect
                  id="worker-cpu"
                  value={String(values.customCpu)}
                  onChange={handleCpuChange}
                  aria-label="Worker node CPU cores"
                >
                  {CPU_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>

            <GridItem span={4}>
              <FormGroup
                label="Worker node memory (GB)"
                isRequired
                fieldId="worker-memory"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="Worker node memory size"
                    bodyContent="The amount of memory in GB allocated to each worker node. Choose based on your workload requirements."
                  />
                }
              >
                <FormSelect
                  id="worker-memory"
                  value={String(values.customMemoryGb)}
                  onChange={handleMemoryChange}
                  aria-label="Worker node memory size"
                >
                  {MEMORY_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>

            <GridItem span={4}>
              <FormGroup
                label="CPU overcommitment"
                isRequired
                fieldId="cpu-overcommit-ratio"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="CPU overcommitment"
                    bodyContent="The ratio of virtual CPUs to physical cores. Higher ratios allow more VMs but may impact performance if all VMs peak at once. Example: At 1:4, you can run 400 virtual CPUs on 100 physical cores."
                  />
                }
              >
                <FormSelect
                  id="cpu-overcommit-ratio"
                  value={String(values.cpuOvercommitRatio)}
                  onChange={handleCpuOvercommitChange}
                  aria-label="CPU overcommitment ratio"
                >
                  {CPU_OVERCOMMIT_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>

            <GridItem span={4}>
              <FormGroup
                label="Memory overcommitment"
                isRequired
                fieldId="memory-overcommit-ratio"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="Memory overcommitment"
                    bodyContent="The ratio of virtual memory to physical memory. Higher ratios allow more VMs; memory overcommit is typically more conservative than CPU (max 1:4)."
                  />
                }
              >
                <FormSelect
                  id="memory-overcommit-ratio"
                  value={String(values.memoryOvercommitRatio)}
                  onChange={handleMemoryOvercommitChange}
                  aria-label="Memory overcommitment ratio"
                >
                  {MEMORY_OVERCOMMIT_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>
          </>
        )}

        {/* Control plane section - show for Full HA and Single node */}
        {showControlPlane && (
          <>
            <GridItem span={12}>
              <hr className={sectionDividerStyle} />
            </GridItem>

            <GridItem span={12}>
              <div className={sectionHeaderStyle}>Control plane</div>
            </GridItem>

            <GridItem span={6}>
              <FormGroup
                label="Control plane CPU core"
                isRequired
                fieldId="control-plane-cpu"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="Control plane CPU cores"
                    bodyContent="The number of CPU cores allocated to each control plane node."
                  />
                }
              >
                <FormSelect
                  id="control-plane-cpu"
                  value={String(values.controlPlaneCpu)}
                  onChange={handleControlPlaneCpuChange}
                  aria-label="Control plane CPU cores"
                >
                  {CONTROL_PLANE_CPU_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>

            <GridItem span={6}>
              <FormGroup
                label="Control plane memory (GB)"
                isRequired
                fieldId="control-plane-memory"
                labelHelp={
                  <PopoverIcon
                    noVerticalAlign
                    headerContent="Control plane memory size"
                    bodyContent="The amount of memory in GB allocated to each control plane node."
                  />
                }
              >
                <FormSelect
                  id="control-plane-memory"
                  value={String(values.controlPlaneMemoryGb)}
                  onChange={handleControlPlaneMemoryChange}
                  aria-label="Control plane memory size"
                >
                  {CONTROL_PLANE_MEMORY_OPTIONS.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={String(option.value)}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </GridItem>
          </>
        )}
      </Grid>
    </Form>
  );
};

SizingInputForm.displayName = "SizingInputForm";

export default SizingInputForm;
