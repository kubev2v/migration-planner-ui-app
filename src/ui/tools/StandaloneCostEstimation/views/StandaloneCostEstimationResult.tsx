import { css } from "@emotion/css";
import {
  Card,
  CardBody,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import type {
  CostEstimationBreakdown,
  StandaloneCostEstimateResponse,
  VMwarePlanName,
} from "../../../../models/StandaloneCostEstimationModel";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const heroCardStyle = css`
  text-align: center;
  background-color: var(--pf-t--global--background--color--secondary--default);
`;

const heroTitleStyle = css`
  text-transform: uppercase;
  color: var(--pf-t--global--color--brand--default);
  margin-bottom: var(--pf-t--global--spacer--md);
`;

const heroPriceStyle = css`
  font-size: 3.5em;
  line-height: 1;
  font-weight: var(--pf-t--global--font--weight--heading--default);
  color: var(--pf-t--global--color--brand--default);
`;

const heroSubtitleStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-top: var(--pf-t--global--spacer--sm);
`;

const sectionTitleStyle = css`
  margin-top: var(--pf-t--global--spacer--md);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const sectionDescriptionStyle = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--md);
`;

const breakdownTableStyle = css`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const metricLabelStyle = css`
  font-size: var(--pf-t--global--font--size--body--md);
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const metricValueStyle = css`
  font-size: var(--pf-t--global--font--size--2xl);
  font-weight: var(--pf-t--global--font--weight--heading--default);
  color: var(--pf-t--global--text--color--regular);
`;

const savingsValueBaseStyle = css`
  font-size: var(--pf-t--global--font--size--2xl);
  font-weight: var(--pf-t--global--font--weight--heading--default);
`;

const savingsPositiveStyle = css`
  color: var(--pf-t--global--color--status--success--default);
`;

const savingsNegativeStyle = css`
  color: var(--pf-t--global--color--status--danger--default);
`;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VMWARE_PLAN_LABELS: Record<VMwarePlanName, string> = {
  vmwareVcf: "VMware VCF",
  vmwareVvf: "VMware VVF",
  vmwareVvs: "VMware VVS",
};

const VMWARE_PLAN_FULL_LABELS: Record<VMwarePlanName, string> = {
  vmwareVcf: "VMware Cloud Foundation (VCF)",
  vmwareVvf: "VMware vSphere Foundation (VVF)",
  vmwareVvs: "VMware vSphere Standard (VVS)",
};

const BREAKDOWN_ROWS: { label: string; key: keyof CostEstimationBreakdown }[] =
  [
    { label: "Software subscriptions", key: "softwareSubscriptions" },
    { label: "Ansible Automation Platform", key: "ansibleAutomationPlatform" },
    { label: "Migration cost", key: "migrationConsultingServices" },
    { label: "Swing hardware", key: "swingHardwareUpgrades" },
    { label: "Additional storage", key: "additionalStorageCosts" },
    { label: "ISV / other", key: "thirdPartyIsvCosts" },
  ];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCompactCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const formatFullCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

const formatCell = (value: number): string => {
  return value === 0 ? "—" : formatFullCurrency(value);
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface StandaloneCostEstimationResultProps {
  data: StandaloneCostEstimateResponse;
}

export const StandaloneCostEstimationResult: React.FC<
  StandaloneCostEstimationResultProps
> = ({ data }) => {
  const { redhat, vmwareResults, targetEnvironment, assumptions } = data;

  return (
    <Stack hasGutter>
      {/* Hero card */}
      <StackItem>
        <Card className={heroCardStyle}>
          <CardBody>
            <div className={heroTitleStyle}>
              Total OpenShift 3-year cost estimation
            </div>
            <p className={heroPriceStyle}>
              {formatCompactCurrency(redhat.totalThreeYearCostEstimation)}
            </p>
            <Content
              component={ContentVariants.p}
              className={heroSubtitleStyle}
            >
              {data.customerName ? `Customer ${data.customerName} · ` : ""}
              {formatFullCurrency(redhat.totalThreeYearCostEstimation)} total
              cost of ownership (TCO)
            </Content>
          </CardBody>
        </Card>
      </StackItem>

      {/* Savings vs VMware */}
      {vmwareResults.some((vm) => vm.savingsVsRedhat !== null) && (
        <StackItem>
          <Title headingLevel="h3" className={sectionTitleStyle}>
            Savings vs VMware
          </Title>
          <Content
            component={ContentVariants.small}
            className={sectionDescriptionStyle}
          >
            Dollar amount and percent saved compared with each VMware
            plan&apos;s 3-year cost. Percent is Red Hat savings divided by that
            plan&apos;s total.
          </Content>
          <Grid hasGutter>
            {vmwareResults.map(
              (vm) =>
                vm.savingsVsRedhat && (
                  <GridItem md={6} key={vm.vmwareSolution}>
                    <Card isCompact isFullHeight>
                      <CardBody>
                        <p className={metricLabelStyle}>
                          vs {VMWARE_PLAN_FULL_LABELS[vm.vmwareSolution]}
                        </p>
                        <p
                          className={`${savingsValueBaseStyle} ${vm.savingsVsRedhat.absoluteThreeYearUsd >= 0 ? savingsPositiveStyle : savingsNegativeStyle}`}
                        >
                          {formatCompactCurrency(
                            vm.savingsVsRedhat.absoluteThreeYearUsd,
                          )}
                        </p>
                        <Content component={ContentVariants.small}>
                          {vm.savingsVsRedhat.percentage.toFixed(1)}% of{" "}
                          {VMWARE_PLAN_LABELS[vm.vmwareSolution].replace(
                            "VMware ",
                            "",
                          )}{" "}
                          3-year cost
                        </Content>
                      </CardBody>
                    </Card>
                  </GridItem>
                ),
            )}
          </Grid>
        </StackItem>
      )}

      {/* Environment summary */}
      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Environment summary
        </Title>
        <Grid hasGutter>
          <GridItem md={4}>
            <Card isCompact isFullHeight>
              <CardBody>
                <p className={metricLabelStyle}>ESXi hosts</p>
                <p className={metricValueStyle}>
                  {data.customerEnvironment.totalEsxiHosts.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isCompact isFullHeight>
              <CardBody>
                <p className={metricLabelStyle}>Target OpenShift hosts</p>
                <p className={metricValueStyle}>
                  {targetEnvironment.targetHosts.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isCompact isFullHeight>
              <CardBody>
                <p className={metricLabelStyle}>Target VMs</p>
                <p className={metricValueStyle}>
                  {targetEnvironment.targetVMs.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isCompact isFullHeight>
              <CardBody>
                <p className={metricLabelStyle}>Licensed cores</p>
                <p className={metricValueStyle}>
                  {targetEnvironment.totalLicensedCores.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem md={4}>
            <Card isCompact isFullHeight>
              <CardBody>
                <p className={metricLabelStyle}>RH subscriptions</p>
                <p className={metricValueStyle}>
                  {targetEnvironment.rhSubsRequired.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </GridItem>
          {assumptions.swingHosts !== undefined && (
            <GridItem md={4}>
              <Card isCompact isFullHeight>
                <CardBody>
                  <p className={metricLabelStyle}>Swing hosts</p>
                  <p className={metricValueStyle}>
                    {assumptions.swingHosts.toLocaleString()}
                  </p>
                </CardBody>
              </Card>
            </GridItem>
          )}
        </Grid>
      </StackItem>

      {/* Detailed 3-year breakdown */}
      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Detailed 3-year breakdown
        </Title>
        <Content
          component={ContentVariants.small}
          className={sectionDescriptionStyle}
        >
          Figures are estimates for comparison. VMware columns show software
          license cost only; Red Hat includes migration and selected add-ons.
        </Content>
        <div className={breakdownTableStyle}>
          <Table aria-label="Three-year TCO breakdown" variant="compact">
            <Thead>
              <Tr>
                <Th>Cost category</Th>
                {vmwareResults.map((vm) => (
                  <Th key={vm.vmwareSolution}>
                    {VMWARE_PLAN_LABELS[vm.vmwareSolution]}
                  </Th>
                ))}
                <Th>Red Hat ({redhat.rhEdition})</Th>
              </Tr>
            </Thead>
            <Tbody>
              {BREAKDOWN_ROWS.map((row) => (
                <Tr key={row.key}>
                  <Td>{row.label}</Td>
                  {vmwareResults.map((vm) => (
                    <Td key={vm.vmwareSolution}>
                      {formatCell(vm.breakdown[row.key])}
                    </Td>
                  ))}
                  <Td>{formatCell(redhat.breakdown[row.key])}</Td>
                </Tr>
              ))}
              <Tr>
                <Td>Total 3-year TCO</Td>
                {vmwareResults.map((vm) => (
                  <Td key={vm.vmwareSolution}>
                    {formatFullCurrency(vm.totalThreeYearCostEstimation)}
                  </Td>
                ))}
                <Td>
                  {formatFullCurrency(redhat.totalThreeYearCostEstimation)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </div>
      </StackItem>
    </Stack>
  );
};

StandaloneCostEstimationResult.displayName = "StandaloneCostEstimationResult";

export default StandaloneCostEstimationResult;
