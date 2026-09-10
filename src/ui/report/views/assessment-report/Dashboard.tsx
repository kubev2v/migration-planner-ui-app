import type {
  Infra,
  InventoryData,
  VMResourceBreakdown,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import {
  OSDistribution,
  type OSDistributionEntry,
} from "@openshift-migration-advisor/shared-components";
import { Gallery, GalleryItem, Grid, GridItem } from "@patternfly/react-core";
import React, { useMemo } from "react";

import {
  buildClusterDetailRows,
  buildClusterDetails,
  buildInfrastructureSummary,
} from "../../helpers/infrastructureSummary";
import { ClustersOverview } from "./ClustersOverview";
import { CpuAndMemoryOverview } from "./CpuAndMemoryOverview";
import { ErrorTable } from "./ErrorTable";
import { HostPowerStates } from "./HostPowerStates";
import { HostsOverview } from "./HostsOverview";
import { InfrastructureSummary } from "./InfrastructureSummary";
import { NetworkOverview } from "./NetworkOverview";
import { StorageOverview } from "./StorageOverview";
import { VCenterClusterDetails } from "./VCenterClusterDetails";
import { VMMigrationStatus } from "./VMMigrationStatus";
import { VmPowerStates } from "./VmPowerStates";
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

  const infrastructureSummary = useMemo(
    () =>
      buildInfrastructureSummary({
        infra,
        vcenterVersion,
        vcenterId,
        clusters,
      }),
    [infra, vcenterVersion, vcenterId, clusters],
  );

  const clusterDetailRows = useMemo(
    () => buildClusterDetailRows(clusters),
    [clusters],
  );

  const selectedClusterDetails = useMemo(() => {
    if (isAggregateView || !clusters) {
      return undefined;
    }
    const selectedClusterId = Object.keys(clusters)[0];
    return selectedClusterId
      ? buildClusterDetails(clusters[selectedClusterId])
      : undefined;
  }, [isAggregateView, clusters]);

  // If a cluster was selected but not found, show a lightweight empty view.
  if (!clusterFound && !isAggregateView) {
    return (
      <Grid hasGutter>
        <GridItem span={12}>
          <div style={{ padding: "24px" }}>
            No data is available for the selected cluster.
          </div>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid hasGutter>
      <GridItem span={12} data-export-block={isExportMode ? "1" : undefined}>
        <InfrastructureSummary summary={infrastructureSummary} />
      </GridItem>
      <GridItem span={12} data-export-block={isExportMode ? "1b" : undefined}>
        <VCenterClusterDetails
          isAggregateView={isAggregateView}
          rows={clusterDetailRows}
          details={selectedClusterDetails}
          isExportMode={isExportMode}
        />
      </GridItem>
      <GridItem span={12} data-export-block={isExportMode ? "1c" : undefined}>
        <Gallery hasGutter minWidths={{ default: "40%" }}>
          <GalleryItem>
            <HostPowerStates infra={infra} isExportMode={isExportMode} />
          </GalleryItem>
          <GalleryItem>
            <VmPowerStates vms={vms} isExportMode={isExportMode} />
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem span={12} data-export-block={isExportMode ? "2" : undefined}>
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
            <OSDistribution osData={osData} isExportMode={isExportMode} />
          </GalleryItem>
        </Gallery>
      </GridItem>
      <GridItem span={12} data-export-block={isExportMode ? "3" : undefined}>
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
        <GridItem span={12} data-export-block={isExportMode ? "4" : undefined}>
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
        <GridItem span={12} data-export-block={isExportMode ? "4" : undefined}>
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
        <GridItem span={12} data-export-block={isExportMode ? "4a" : undefined}>
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
      <GridItem span={12} data-export-block={isExportMode ? "5" : undefined}>
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
