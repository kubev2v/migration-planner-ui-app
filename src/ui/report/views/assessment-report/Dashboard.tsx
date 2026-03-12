import type {
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { Grid, GridItem, PageSection } from "@patternfly/react-core";
import React from "react";

import { OSDistribution } from "./OSDistribution";

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
  vms: VMs;
  isExportMode?: boolean;
  exportAllViews?: boolean;
  clusters?: { [key: string]: InventoryData };
  isAggregateView?: boolean;
  clusterFound?: boolean;
}

export const Dashboard: React.FC<Props> = ({
  vms,
  isExportMode,
  clusterFound = true,
  isAggregateView = true,
}) => {
  // Transform osInfo to include both count and supported fields, fallback to os with supported=true if osInfo is undefined
  const osData = vms.osInfo
    ? Object.entries(vms.osInfo).reduce(
        (acc, [osName, osInfo]) => {
          acc[osName] = {
            count: osInfo.count,
            supported: osInfo.supported,
            upgradeRecommendation: osInfo.upgradeRecommendation ?? "",
          };
          return acc;
        },
        {} as {
          [osName: string]: {
            count: number;
            supported: boolean;
            upgradeRecommendation: string;
          };
        },
      )
    : Object.entries(vms.os ?? {}).reduce(
        (acc, [osName, count]) => {
          acc[osName] = {
            count: count,
            supported: true,
            upgradeRecommendation: "",
          };
          return acc;
        },
        {} as {
          [osName: string]: {
            count: number;
            supported: boolean;
            upgradeRecommendation: string;
          };
        },
      );

  if (!clusterFound && !isAggregateView) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem span={12}>
            <div style={{ padding: "24px" }}>
              No data is available for the selected cluster.
            </div>
          </GridItem>
        </Grid>
      </PageSection>
    );
  }

  return (
    <PageSection hasBodyWrapper={false}>
      <Grid hasGutter>
        <GridItem span={12}>
          <OSDistribution osData={osData} isExportMode={isExportMode} />
        </GridItem>
      </Grid>
    </PageSection>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
