import { css } from "@emotion/css";
import {
  Alert,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import RhUiCpuIcon from "@patternfly/react-icons/dist/esm/icons/cpu-icon";
import RhUiServerGroupIcon from "@patternfly/react-icons/dist/esm/icons/server-group-icon";
import RhUiServerIcon from "@patternfly/react-icons/dist/esm/icons/server-icon";
import RhUiVirtualMachineIcon from "@patternfly/react-icons/dist/esm/icons/virtual-machine-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import type {
  CostEstimationBreakdown,
  CostEstimationResponse,
  VMwareSolutionName,
} from "../../../../../models/CostEstimationModel";

interface CostEstimationResultProps {
  costEstimation: CostEstimationResponse | null;
}

const heroCardStyle = css`
  text-align: center;
`;

const heroTitleStyle = css`
  text-transform: uppercase;
  color: var(--pf-t--global--color--brand--default);
  margin-bottom: var(--pf-t--global--spacer--md);
`;

const heroPriceSkeletonStyle = css`
  display: flex;
  justify-content: center;
  height: 84px;
`;

const heroPriceStyle = css`
  font-size: 3.5em;
  line-height: 1;
  font-weight: var(--pf-t--global--font--weight--heading--default);
  color: var(--pf-t--global--color--brand--default);
`;

const breakdownPriceSkeletonStyle = css`
  display: flex;
  justify-content: center;
`;

const breakdownCardStyle = css`
  text-align: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const breakdownLabelStyle = css`
  font-size: var(--pf-t--global--font--size--body--md);
  color: var(--pf-t--global--text--color--subtle);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const breakdownValueStyle = css`
  font-size: var(--pf-t--global--font--size--2xl);
  font-weight: var(--pf-t--global--font--weight--heading--default);
  color: var(--pf-t--global--text--color--regular);
`;

const breakdownTdStyle = css`
  text-align: right;
`;

const tBodyStyle = css`
  tr:nth-last-child(2) {
    --pf-v6-c-table__tr--BorderBlockEndColor: var(
      --pf-t--global--border--color--300
    );
  }

  tr:last-child {
    --pf-v6-c-table__tr--BorderBlockEndWidth: 0;
  }
`;

const savingsCardStyle = css`
  background: var(--pf-t--global--background--color--status--success--default);
  border: 1px solid var(--pf-t--global--border--color--status--success--default);
`;

const savingsTitleStyle = css`
  font-size: var(--pf-t--global--font--size--body--default);
  color: var(--pf-t--global--color--status--success--default);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const savingsAmountStyle = css`
  font-size: var(--pf-t--global--font--size--2xl);
  font-weight: var(--pf-t--global--font--weight--heading--default);
  color: var(--pf-t--global--color--status--success--default);
`;

const sectionTitleStyle = css`
  margin-top: var(--pf-t--global--spacer--md);
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const disclaimerStyle = css`
  margin-bottom: var(--pf-t--global--spacer--sm);
`;

const BREAKDOWN_ROWS: { label: string; key: keyof CostEstimationBreakdown }[] =
  [
    { label: "Software Subscriptions", key: "softwareSubscriptions" },
    { label: "Ansible Automation Platform", key: "ansibleAutomationPlatform" },
    {
      label: "Migration Consulting Services",
      key: "migrationConsultingServices",
    },
    { label: "Swing Hardware Upgrades", key: "swingHardwareUpgrades" },
    { label: "Additional Storage Costs", key: "additionalStorageCosts" },
    { label: "Third-party ISV Costs", key: "thirdPartyIsvCosts" },
  ];

const VMWARE_SOLUTION_LABELS: Record<VMwareSolutionName, string> = {
  vmwareVcf: "VMW VCF",
  vmwareVvf: "VMW VVF",
  vmwareVvs: "VMW VVS",
};

const formatCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const formatCell = (value: number): string => {
  return value === 0 ? "-" : formatCurrency(value);
};

const DisclaimerCostEstimationAlert: React.FC = () => (
  <Alert
    variant="info"
    isInline
    title="These figures are estimates based on list prices and the information provided. Actual pricing may vary depending on subscriptions, discounts, regional pricing, and other commercial terms."
    ouiaId="InfoAlert"
    className={disclaimerStyle}
  />
);

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value }) => (
  <Card className={breakdownCardStyle}>
    <CardBody>
      <div className={breakdownLabelStyle}>
        {icon && <>{icon} </>}
        {label}
      </div>
      <div
        className={value ? breakdownValueStyle : breakdownPriceSkeletonStyle}
      >
        {value ?? (
          <Skeleton
            fontSize="2xl"
            width="30%"
            screenreaderText={`Loading ${label}`}
          />
        )}
      </div>
    </CardBody>
  </Card>
);

export const CostEstimationResult: React.FC<CostEstimationResultProps> = ({
  costEstimation,
}) => {
  if (!costEstimation) {
    return null;
  }

  const { redhat, vmware, savings, customerEnvironment } = costEstimation;
  const vmwareLabel = VMWARE_SOLUTION_LABELS[vmware.VMwareSolution];

  return (
    <Stack hasGutter>
      <StackItem>
        <Card className={heroCardStyle}>
          <CardBody>
            <Title headingLevel="h3" className={heroTitleStyle}>
              Total OpenShift 3-Year cost estimation
            </Title>
            <div className={heroPriceStyle}>
              {formatCurrency(redhat.totalThreeYearCostEstimation)}
            </div>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Customer environment
        </Title>
        <Grid hasGutter md={6} lg={3}>
          <GridItem>
            <MetricCard
              icon={<RhUiServerIcon />}
              label="Total ESXi hosts"
              value={customerEnvironment.totalEsxiHosts}
            />
          </GridItem>
          <GridItem>
            <MetricCard
              icon={<RhUiServerGroupIcon />}
              label="Sockets per host"
              value={customerEnvironment.socketsPerHost}
            />
          </GridItem>
          <GridItem>
            <MetricCard
              icon={<RhUiCpuIcon />}
              label="Cores per socket"
              value={customerEnvironment.coresPerSocket}
            />
          </GridItem>
          <GridItem>
            <MetricCard
              icon={<RhUiVirtualMachineIcon />}
              label="Total virtual machines"
              value={customerEnvironment.totalVirtualMachines}
            />
          </GridItem>
        </Grid>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Detailed 3-Year Breakdown
        </Title>

        <DisclaimerCostEstimationAlert />

        <Card>
          <CardBody>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th className={breakdownTdStyle}>{vmwareLabel}</Th>
                  <Th className={breakdownTdStyle}>Red Hat</Th>
                </Tr>
              </Thead>
              <Tbody className={tBodyStyle}>
                {BREAKDOWN_ROWS.map((row) => (
                  <Tr key={row.key}>
                    <Td>{row.label}</Td>
                    <Td className={breakdownTdStyle}>
                      {formatCell(vmware.breakdown[row.key])}
                    </Td>
                    <Td className={breakdownTdStyle}>
                      {formatCell(redhat.breakdown[row.key])}
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td>Total 3-Year TCO</Td>
                  <Td className={breakdownTdStyle}>
                    {formatCurrency(vmware.totalThreeYearCostEstimation)}
                  </Td>
                  <Td className={breakdownTdStyle}>
                    {formatCurrency(redhat.totalThreeYearCostEstimation)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </StackItem>

      {savings && (
        <StackItem>
          <Title headingLevel="h3" className={sectionTitleStyle}>
            Savings summary
          </Title>
          <Grid hasGutter md={12} lg={6}>
            <GridItem>
              <Card className={savingsCardStyle}>
                <CardBody>
                  <Flex
                    justifyContent={{
                      default: "justifyContentSpaceBetween",
                    }}
                    alignItems={{ default: "alignItemsCenter" }}
                  >
                    <FlexItem>
                      <div className={savingsAmountStyle}>
                        {formatCurrency(savings.absoluteThreeYearUsd)}
                      </div>
                      <Label color="green">
                        {savings.percentage.toFixed(1)}% Saved
                      </Label>
                    </FlexItem>
                    <FlexItem>
                      <div className={savingsTitleStyle}>
                        Savings vs {vmwareLabel}
                      </div>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>
      )}
    </Stack>
  );
};

CostEstimationResult.displayName = "CostEstimationResult";

export const CostEstimationResultSkeleton: React.FC = () => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Card className={heroCardStyle}>
          <CardBody>
            <Title headingLevel="h3" className={heroTitleStyle}>
              Total OpenShift 3-Year cost estimation
            </Title>
            <div className={heroPriceSkeletonStyle}>
              <Skeleton
                fontSize="4xl"
                width="30%"
                height="100%"
                screenreaderText="Loading total cost value"
              />
            </div>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Customer environment
        </Title>
        <Grid hasGutter md={6} lg={3}>
          <GridItem>
            <MetricCard icon={<RhUiServerIcon />} label="Total ESXi hosts" />
          </GridItem>
          <GridItem>
            <MetricCard
              icon={<RhUiServerGroupIcon />}
              label="Sockets per host"
            />
          </GridItem>
          <GridItem>
            <MetricCard icon={<RhUiCpuIcon />} label="Cores per socket" />
          </GridItem>
          <GridItem>
            <MetricCard
              icon={<RhUiVirtualMachineIcon />}
              label="Total virtual machines"
            />
          </GridItem>
        </Grid>
      </StackItem>

      <StackItem>
        <Title headingLevel="h3" className={sectionTitleStyle}>
          Detailed 3-Year Breakdown
        </Title>

        <DisclaimerCostEstimationAlert />

        <Card>
          <CardBody>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th className={breakdownTdStyle}>VMware</Th>
                  <Th className={breakdownTdStyle}>Red Hat</Th>
                </Tr>
              </Thead>
              <Tbody className={tBodyStyle}>
                {BREAKDOWN_ROWS.map((row) => (
                  <Tr key={row.key}>
                    <Td>{row.label}</Td>
                    <Td className={breakdownTdStyle}>
                      <Skeleton />
                    </Td>
                    <Td className={breakdownTdStyle}>
                      <Skeleton />
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td>Total 3-Year TCO</Td>
                  <Td className={breakdownTdStyle}>
                    <Skeleton />
                  </Td>
                  <Td className={breakdownTdStyle}>
                    <Skeleton />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
};

CostEstimationResultSkeleton.displayName = "CostEstimationResultSkeleton";

export default CostEstimationResult;
