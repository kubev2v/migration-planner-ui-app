import type {
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import {
  ErrorTable,
  HostPowerStates,
  HostsOverview,
  InfrastructureSummary,
  NetworkOverview,
  OSDistribution,
  type OSDistributionEntry,
  VCenterClusterDetails,
  VmPowerStates,
  WarningsTable,
} from "@openshift-migration-advisor/shared-components";
import { Gallery, GalleryItem, Grid, GridItem } from "@patternfly/react-core";
import React from "react";

import { useDashboardViewModel } from "../../view-models/useDashboardViewModel";
import { ClustersOverview } from "./ClustersOverview";
import { CpuAndMemoryOverview } from "./CpuAndMemoryOverview";
import { StorageOverview } from "./StorageOverview";
import { VMMigrationStatus } from "./VMMigrationStatus";

interface Props {
  infra: Infra;
  cpuCores: VMResourceBreakdown;
  ramGB: VMResourceBreakdown;
  vms: VMs;
  clusters?: { [key: string]: InventoryData };
  isAggregateView?: boolean;
  clusterFound?: boolean;
  vcenterVersion?: string;
  vcenterId?: string;
}

export const Dashboard: React.FC<Props> = ({
  infra,
  cpuCores,
  ramGB,
  vms,
  clusters,
  isAggregateView = true,
  clusterFound = true,
  vcenterVersion,
  vcenterId,
}) => {
  const { infrastructureSummary, clusterDetailRows, selectedClusterDetails } =
    useDashboardViewModel({
      infra,
      vcenterVersion,
      vcenterId,
      clusters,
      isAggregateView,
    });

  // Transform osInfo to include both count and supported fields, fallback to os with supported=true if osInfo is undefined
  const osData = vms.osInfo
    ? Object.entries(vms.osInfo).reduce(
        (acc, [osName, osInfo]) => {
          acc[osName] = {
            count: osInfo.count,
            supported: osInfo.supported,
            supportTier: osInfo.supportTier,
            upgradeRecommendation: osInfo.upgradeRecommendation ?? "",
          };
          return acc;
        },
        {} as Record<string, OSDistributionEntry>,
      )
    : Object.entries(vms.os ?? {}).reduce(
        (acc, [osName, count]) => {
          acc[osName] = {
            count: count,
            supported: true, // Default to supported when using fallback data
            upgradeRecommendation: "",
          };
          return acc;
        },
        {} as Record<string, OSDistributionEntry>,
      );

  // If a cluster was selected but not found, show a lightweight empty view.
  if (!clusterFound && !isAggregateView) {
    return (
      <Grid hasGutter>
        <GridItem>
          <div style={{ padding: "24px" }}>
            No data is available for the selected cluster.
          </div>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <InfrastructureSummary summary={infrastructureSummary} />
      </GridItem>
      <GridItem>
        <VCenterClusterDetails
          isAggregateView={isAggregateView}
          rows={clusterDetailRows}
          details={selectedClusterDetails}
        />
      </GridItem>
      <GridItem>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <HostPowerStates
              hostPowerStates={infra.hostPowerStates}
              legendVariant="chart"
            />
          </GalleryItem>
          <GalleryItem>
            <VmPowerStates
              powerStates={vms.powerStates}
              legendVariant="chart"
            />
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <VMMigrationStatus
              data={{
                migratable: vms.totalMigratable,
                nonMigratable: vms.total - vms.totalMigratable,
              }}
              issuesBreakdown={vms.issuesBreakdown}
            />
          </GalleryItem>
          <GalleryItem>
            <OSDistribution osData={osData} />
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <CpuAndMemoryOverview
              cpuTierDistribution={vms.distributionByCpuTier}
              memoryTierDistribution={vms.distributionByMemoryTier}
              memoryTotalGB={ramGB?.total}
              cpuTotalCores={cpuCores?.total}
            />
          </GalleryItem>
          <GalleryItem>
            <StorageOverview
              DiskSizeTierSummary={vms.diskSizeTier ?? {}}
              diskTypeSummary={vms.diskTypes ?? {}}
              totalVMs={vms.total}
              totalWithSharedDisks={vms.totalWithSharedDisks}
            />
          </GalleryItem>
        </Gallery>
      </GridItem>

      {isAggregateView ? (
        <GridItem>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <ClustersOverview
                vmsPerCluster={Object.values(clusters || {}).map(
                  (c) => c.vms?.total ?? 0,
                )}
                clustersPerDatacenter={infra.clustersPerDatacenter ?? []}
                clusters={clusters}
              />
            </GalleryItem>
            <GalleryItem>
              <HostsOverview hosts={infra.hosts} legendVariant="chart" />
            </GalleryItem>
          </Gallery>
        </GridItem>
      ) : (
        <GridItem>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <HostsOverview hosts={infra.hosts} legendVariant="chart" />
            </GalleryItem>
            <GalleryItem>
              <NetworkOverview
                infra={infra}
                nicCount={vms.nicCount}
                distributionByNicCount={vms.distributionByNicCount}
                legendVariant="chart"
              />
            </GalleryItem>
          </Gallery>
        </GridItem>
      )}
      {isAggregateView && (
        <GridItem>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <NetworkOverview
                infra={infra}
                nicCount={vms.nicCount}
                distributionByNicCount={vms.distributionByNicCount}
                legendVariant="chart"
              />
            </GalleryItem>
          </Gallery>
        </GridItem>
      )}
      <GridItem>
        <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
          <GalleryItem>
            <WarningsTable warnings={vms.migrationWarnings ?? []} />
          </GalleryItem>
          <GalleryItem>
            <ErrorTable errors={vms.notMigratableReasons ?? []} />
          </GalleryItem>
        </Gallery>
      </GridItem>
    </Grid>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
