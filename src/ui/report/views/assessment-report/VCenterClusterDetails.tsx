import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Label,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";

import type {
  ClusterDetailRow,
  ClusterDetailsModel,
  FeatureStatus,
} from "../../helpers/infrastructureSummary";
import { FeatureStatusBadge } from "./FeatureStatusBadge";
import {
  clusterDetailsInnerCard,
  clusterDetailsTableScroll,
  featureRow,
  networkLabelsWrap,
  summaryCard,
  summaryStat,
  summaryStatLabel,
  summaryStatsRow,
  summaryStatValue,
} from "./styles";

interface VCenterClusterDetailsProps {
  isAggregateView: boolean;
  rows: ClusterDetailRow[];
  details?: ClusterDetailsModel;
  isExportMode?: boolean;
}

const FeatureRow: React.FC<{
  label: string;
  status: FeatureStatus;
}> = ({ label, status }) => (
  <div className={featureRow}>
    <span>{label}</span>
    <FeatureStatusBadge status={status} />
  </div>
);

const AggregateClusterTable: React.FC<{
  rows: ClusterDetailRow[];
  isExportMode: boolean;
}> = ({ rows, isExportMode }) => {
  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: "8px 0",
          color: "var(--pf-t--global--text--color--subtle)",
        }}
      >
        No vSphere clusters detected
      </div>
    );
  }

  return (
    <div
      className={isExportMode ? undefined : clusterDetailsTableScroll}
      data-testid="vcenter-cluster-details-table"
    >
      <Table variant="compact" borders={false} isStickyHeader>
        <Thead>
          <Tr>
            <Th>Cluster name</Th>
            <Th>Hosts</Th>
            <Th>VMs</Th>
            <Th>vMotion</Th>
            <Th>DRS</Th>
            <Th>vSAN</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              <Td dataLabel="Cluster name">{row.name}</Td>
              <Td dataLabel="Hosts">{row.hosts}</Td>
              <Td dataLabel="VMs">{row.vms}</Td>
              <Td dataLabel="vMotion">
                <FeatureStatusBadge status={row.vmotion} />
              </Td>
              <Td dataLabel="DRS">
                <FeatureStatusBadge status={row.drs} />
              </Td>
              <Td dataLabel="vSAN">
                <FeatureStatusBadge status={row.vsan} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

const DetailedClusterView: React.FC<{ details: ClusterDetailsModel }> = ({
  details,
}) => (
  <Grid hasGutter>
    <GridItem span={12}>
      <div className={summaryStatsRow}>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>Hosts</span>
          <span className={summaryStatValue}>{details.hosts}</span>
        </div>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>VMs</span>
          <span className={summaryStatValue}>{details.vms}</span>
        </div>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>Networks detected</span>
          <span className={summaryStatValue}>{details.networksDetected}</span>
        </div>
      </div>
    </GridItem>
    <GridItem md={4} span={12}>
      <Card className={clusterDetailsInnerCard} isPlain>
        <CardTitle>Core infrastructure</CardTitle>
        <CardBody>
          <FeatureRow label="vMotion" status={details.vmotion} />
          <FeatureRow label="DRS" status={details.drs} />
          <FeatureRow label="HA" status={details.ha} />
        </CardBody>
      </Card>
    </GridItem>
    <GridItem md={4} span={12}>
      <Card className={clusterDetailsInnerCard} isPlain>
        <CardTitle>vSAN capabilities</CardTitle>
        <CardBody>
          <FeatureRow label="vSAN" status={details.vsan} />
        </CardBody>
      </Card>
    </GridItem>
    <GridItem md={4} span={12}>
      <Card className={clusterDetailsInnerCard} isPlain>
        <CardTitle>Network topology</CardTitle>
        <CardBody>
          {details.networks.length === 0 ? (
            <span
              style={{
                color: "var(--pf-t--global--text--color--subtle)",
              }}
            >
              No networks detected
            </span>
          ) : (
            <>
              <p className={summaryStatLabel}>
                {details.networksDetected}{" "}
                {details.networksDetected === 1
                  ? "network detected"
                  : "networks detected"}
              </p>
              <div className={networkLabelsWrap}>
                {details.networks.map((network, index) => (
                  <Label
                    key={`${network.name}-${network.vlanId ?? index}`}
                    color="blue"
                    isCompact
                  >
                    {network.displayName}
                  </Label>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </GridItem>
  </Grid>
);

export const VCenterClusterDetails: React.FC<VCenterClusterDetailsProps> = ({
  isAggregateView,
  rows,
  details,
  isExportMode = false,
}) => (
  <Card className={summaryCard} id="vcenter-cluster-details">
    <CardTitle>vCenter cluster details</CardTitle>
    <CardBody>
      {isAggregateView || !details ? (
        <AggregateClusterTable rows={rows} isExportMode={isExportMode} />
      ) : (
        <DetailedClusterView details={details} />
      )}
    </CardBody>
  </Card>
);

VCenterClusterDetails.displayName = "VCenterClusterDetails";
