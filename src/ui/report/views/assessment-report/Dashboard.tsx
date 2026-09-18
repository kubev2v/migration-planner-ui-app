import type {
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import {
  HostPowerStates,
  InfrastructureSummary,
  OSDistribution,
  VCenterClusterDetails,
  VmPowerStates,
} from "@openshift-migration-advisor/shared-components";
import { Gallery, GalleryItem, Grid, GridItem } from "@patternfly/react-core";
import React from "react";

import { useDashboardViewModel } from "../../view-models/useDashboardViewModel";
import { ChartExportCard } from "./ChartPngDownloadButton";
import { ClustersOverview } from "./ClustersOverview";
import { CpuAndMemoryOverview } from "./CpuAndMemoryOverview";
import { ErrorTable } from "./ErrorTable";
import { HostsOverview } from "./HostsOverview";
import { NetworkOverview } from "./NetworkOverview";
import { buildOsDistributionData } from "./OsDistributionData";
import { StorageOverview } from "./StorageOverview";
import { VMMigrationStatus } from "./VMMigrationStatus";
import { WarningsTable } from "./WarningsTable";

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
  vcenterVersion?: string;
  vcenterId?: string;
}

export const Dashboard: React.FC<Props> = ({
  infra,
  cpuCores,
  ramGB,
  vms,
  isExportMode,
  exportAllViews,
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

  const osData = buildOsDistributionData(vms);

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
      <GridItem data-export-block={isExportMode ? "1" : undefined}>
        <ChartExportCard
          filename="infrastructure-summary"
          showDownload={!isExportMode}
        >
          <InfrastructureSummary summary={infrastructureSummary} />
        </ChartExportCard>
      </GridItem>
      <GridItem data-export-block={isExportMode ? "1a" : undefined}>
        <ChartExportCard
          filename="vcenter-cluster-details"
          showDownload={!isExportMode}
        >
          <VCenterClusterDetails
            isAggregateView={isAggregateView}
            rows={clusterDetailRows}
            details={selectedClusterDetails}
            isExportMode={isExportMode}
          />
        </ChartExportCard>
      </GridItem>
      <GridItem data-export-block={isExportMode ? "1b" : undefined}>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <ChartExportCard
              filename="host-power-states"
              showDownload={!isExportMode}
            >
              <HostPowerStates
                hostPowerStates={infra.hostPowerStates}
                isExportMode={isExportMode}
                legendVariant="chart"
              />
            </ChartExportCard>
          </GalleryItem>
          <GalleryItem>
            <ChartExportCard
              filename="vm-power-states"
              showDownload={!isExportMode}
            >
              <VmPowerStates
                powerStates={vms.powerStates}
                isExportMode={isExportMode}
                legendVariant="chart"
              />
            </ChartExportCard>
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem data-export-block={isExportMode ? "2" : undefined}>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <VMMigrationStatus
              data={{
                migratable: vms.totalMigratable,
                nonMigratable: vms.total - vms.totalMigratable,
              }}
              issuesBreakdown={vms.issuesBreakdown}
              isExportMode={isExportMode}
              exportAllViews={exportAllViews}
            />
          </GalleryItem>
          <GalleryItem>
            <ChartExportCard
              filename="operating-systems"
              showDownload={!isExportMode}
            >
              <OSDistribution osData={osData} isExportMode={isExportMode} />
            </ChartExportCard>
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem data-export-block={isExportMode ? "3" : undefined}>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <CpuAndMemoryOverview
              isExportMode={isExportMode}
              exportAllViews={exportAllViews}
              cpuTierDistribution={vms.distributionByCpuTier}
              memoryTierDistribution={vms.distributionByMemoryTier}
              memoryTotalGB={ramGB?.total}
              cpuTotalCores={cpuCores?.total}
            />
          </GalleryItem>
          <GalleryItem>
            <StorageOverview
              DiskSizeTierSummary={vms.diskSizeTier ?? {}}
              isExportMode={isExportMode}
              exportAllViews={exportAllViews}
              diskTypeSummary={vms.diskTypes ?? {}}
              totalVMs={vms.total}
              totalWithSharedDisks={vms.totalWithSharedDisks}
            />
          </GalleryItem>
        </Gallery>
      </GridItem>

      {isAggregateView ? (
        <GridItem data-export-block={isExportMode ? "4" : undefined}>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <ClustersOverview
                vmsPerCluster={Object.values(clusters || {}).map(
                  (c) => c.vms?.total ?? 0,
                )}
                clustersPerDatacenter={infra.clustersPerDatacenter ?? []}
                isExportMode={isExportMode}
                exportAllViews={exportAllViews}
                clusters={clusters}
              />
            </GalleryItem>
            <GalleryItem>
              <HostsOverview
                hosts={infra.hosts}
                isExportMode={isExportMode}
                exportAllViews={exportAllViews}
              />
            </GalleryItem>
          </Gallery>
        </GridItem>
      ) : (
        <GridItem data-export-block={isExportMode ? "4" : undefined}>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <HostsOverview
                hosts={infra.hosts}
                isExportMode={isExportMode}
                exportAllViews={exportAllViews}
              />
            </GalleryItem>
            <GalleryItem>
              <NetworkOverview
                infra={infra}
                nicCount={vms.nicCount}
                distributionByNicCount={vms.distributionByNicCount}
                isExportMode={isExportMode}
                exportAllViews={exportAllViews}
              />
            </GalleryItem>
          </Gallery>
        </GridItem>
      )}
      {isAggregateView && (
        <GridItem data-export-block={isExportMode ? "4a" : undefined}>
          <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
            <GalleryItem>
              <NetworkOverview
                infra={infra}
                nicCount={vms.nicCount}
                distributionByNicCount={vms.distributionByNicCount}
                isExportMode={isExportMode}
                exportAllViews={exportAllViews}
              />
            </GalleryItem>
          </Gallery>
        </GridItem>
      )}
      <GridItem data-export-block={isExportMode ? "5" : undefined}>
        <Gallery hasGutter minWidths={{ default: "300px", md: "45%" }}>
          <GalleryItem>
            <WarningsTable
              warnings={vms.migrationWarnings ?? []}
              isExportMode={isExportMode}
            />
          </GalleryItem>
          <GalleryItem>
            <ErrorTable
              errors={vms.notMigratableReasons ?? []}
              isExportMode={isExportMode}
            />
          </GalleryItem>
        </Gallery>
      </GridItem>
    </Grid>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
