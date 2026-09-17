import type {
  Infra,
  InventoryData,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import {
  buildClusterDetailRows,
  buildClusterDetails,
  buildHostPowerStateChart,
  buildInfrastructureSummary,
  buildVmPowerStateChart,
  CardEmptyState,
  InfrastructureSummary,
  MigrationDonutChart,
  OSBarChart,
  REPORT_CARD_EMPTY_STATE_TITLES,
  VCenterClusterDetails,
} from "@openshift-migration-advisor/shared-components";
import type { ReactNode } from "react";

import {
  ClustersOverview,
  type ClustersOverviewView,
} from "./ClustersOverview";
import {
  CpuAndMemoryOverview,
  type CpuAndMemoryView,
} from "./CpuAndMemoryOverview";
import { ExportGraphFrame } from "./ExportGraphFrame";
import { HostsOverview } from "./HostsOverview";
import { NetworkOverview, type NetworkOverviewView } from "./NetworkOverview";
import { buildOsDistributionData } from "./OsDistributionData";
import { StorageOverview, type StorageOverviewView } from "./StorageOverview";
import {
  VMMigrationStatus,
  type VMMigrationStatusView,
} from "./VMMigrationStatus";

export interface PngChartExportJob {
  filename: string;
  render: () => ReactNode;
}

export interface PngChartExportData {
  infra: Infra;
  vms: VMs;
  cpuCores: { total?: number };
  ramGB: { total?: number };
  clusters?: { [key: string]: InventoryData };
  isAggregateView: boolean;
  vcenterVersion?: string;
  vcenterId?: string;
}

const VM_MIGRATION_STATUS_VIEWS: VMMigrationStatusView[] = [
  "issuesVsNoIssues",
  "issuesBreakdown",
];

const CPU_AND_MEMORY_VIEWS: CpuAndMemoryView[] = ["memoryTiers", "vcpuTiers"];

const STORAGE_VIEWS: StorageOverviewView[] = [
  "vmCountByDiskType",
  "vmCount",
  "totalSize",
  "sharedDisks",
];

const CLUSTER_VIEWS: ClustersOverviewView[] = [
  "vmByCluster",
  "dataCenterDistribution",
  "cpuOverCommitment",
];

const NETWORK_VIEWS: NetworkOverviewView[] = [
  "networkDistribution",
  "nicCount",
];

const POWER_DONUT_PROPS = {
  legendVariant: "chart" as const,
  height: 300,
  width: 420,
  donutThickness: 18,
  padAngle: 1,
  subTitleColor: "var(--pf-t--global--text--color--subtle)",
  titleFontSize: 34,
  labelFontSize: 16,
  itemsPerRow: 2,
  marginLeft: "0%",
};

const viewSlug = (view: string): string =>
  view.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const renderPowerDonut = (
  chart: ReturnType<typeof buildHostPowerStateChart>,
  emptyTitle: string,
  subTitle: string,
): ReactNode =>
  chart.total === 0 ? (
    <CardEmptyState title={emptyTitle} />
  ) : (
    <MigrationDonutChart
      {...POWER_DONUT_PROPS}
      data={chart.slices}
      legend={chart.legend}
      title={`${chart.total}`}
      subTitle={subTitle}
      tooltipLabelFormatter={({ datum, percent }) =>
        `${datum.countDisplay}\n${percent.toFixed(1)}%`
      }
    />
  );

/**
 * One PNG per chart view. ZIP paints these together as graph-only frames
 * (title + chart, no PatternFly Card chrome).
 */
export const buildPngChartExportJobs = (
  data: PngChartExportData,
): PngChartExportJob[] => {
  const osData = buildOsDistributionData(data.vms);
  const infrastructureSummary = buildInfrastructureSummary({
    infra: data.infra,
    vcenterVersion: data.vcenterVersion,
    vcenterId: data.vcenterId,
    clusters: data.clusters,
  });
  const clusterDetailRows = buildClusterDetailRows(data.clusters);
  const selectedClusterId =
    !data.isAggregateView && data.clusters
      ? Object.keys(data.clusters)[0]
      : undefined;
  const selectedClusterDetails =
    selectedClusterId && data.clusters
      ? buildClusterDetails(data.clusters[selectedClusterId])
      : undefined;
  const hostPower = buildHostPowerStateChart(data.infra.hostPowerStates);
  const vmPower = buildVmPowerStateChart(data.vms.powerStates);

  const jobs: PngChartExportJob[] = [
    {
      filename: "infrastructure-summary",
      render: () => <InfrastructureSummary summary={infrastructureSummary} />,
    },
    {
      filename: "vcenter-cluster-details",
      render: () => (
        <VCenterClusterDetails
          isAggregateView={data.isAggregateView}
          rows={clusterDetailRows}
          details={selectedClusterDetails}
          isExportMode
        />
      ),
    },
    {
      filename: "host-power-states",
      render: () => (
        <ExportGraphFrame title="ESXi host power states">
          {renderPowerDonut(
            hostPower,
            REPORT_CARD_EMPTY_STATE_TITLES.hostPowerStates,
            "Hosts",
          )}
        </ExportGraphFrame>
      ),
    },
    {
      filename: "vm-power-states",
      render: () => (
        <ExportGraphFrame title="VM power states">
          {renderPowerDonut(
            vmPower,
            REPORT_CARD_EMPTY_STATE_TITLES.vmPowerStates,
            "VMs",
          )}
        </ExportGraphFrame>
      ),
    },
    ...VM_MIGRATION_STATUS_VIEWS.map((exportView) => ({
      filename: `vm-migration-status-${viewSlug(exportView)}`,
      render: () => (
        <VMMigrationStatus
          data={{
            migratable: data.vms.totalMigratable,
            nonMigratable: data.vms.total - data.vms.totalMigratable,
          }}
          issuesBreakdown={data.vms.issuesBreakdown}
          isExportMode
          exportView={exportView}
          graphOnly
        />
      ),
    })),
  ];

  jobs.push({
    filename: "operating-systems",
    render: () => (
      <ExportGraphFrame title="Operating Systems">
        <OSBarChart osData={osData} isExportMode />
      </ExportGraphFrame>
    ),
  });

  jobs.push(
    ...CPU_AND_MEMORY_VIEWS.map((exportView) => ({
      filename: `cpu-and-memory-${viewSlug(exportView)}`,
      render: () => (
        <CpuAndMemoryOverview
          isExportMode
          exportView={exportView}
          graphOnly
          cpuTierDistribution={data.vms.distributionByCpuTier}
          memoryTierDistribution={data.vms.distributionByMemoryTier}
          memoryTotalGB={data.ramGB?.total}
          cpuTotalCores={data.cpuCores?.total}
        />
      ),
    })),
  );

  const storageViews = STORAGE_VIEWS.filter(
    (view) => view !== "sharedDisks" || data.vms.totalWithSharedDisks,
  );
  jobs.push(
    ...storageViews.map((exportView) => ({
      filename: `disks-${viewSlug(exportView)}`,
      render: () => (
        <StorageOverview
          DiskSizeTierSummary={data.vms.diskSizeTier ?? {}}
          isExportMode
          exportView={exportView}
          graphOnly
          diskTypeSummary={data.vms.diskTypes ?? {}}
          totalVMs={data.vms.total}
          totalWithSharedDisks={data.vms.totalWithSharedDisks}
        />
      ),
    })),
  );

  if (data.isAggregateView) {
    jobs.push(
      ...CLUSTER_VIEWS.map((exportView) => ({
        filename: `clusters-${viewSlug(exportView)}`,
        render: () => (
          <ClustersOverview
            vmsPerCluster={Object.values(data.clusters || {}).map(
              (c) => c.vms?.total ?? 0,
            )}
            clustersPerDatacenter={data.infra.clustersPerDatacenter ?? []}
            isExportMode
            exportView={exportView}
            graphOnly
            clusters={data.clusters}
          />
        ),
      })),
    );
  }

  jobs.push({
    filename: "hosts",
    render: () => (
      <HostsOverview hosts={data.infra.hosts} isExportMode graphOnly />
    ),
  });

  jobs.push(
    ...NETWORK_VIEWS.map((exportView) => ({
      filename: `networks-${viewSlug(exportView)}`,
      render: () => (
        <NetworkOverview
          infra={data.infra}
          nicCount={data.vms.nicCount}
          distributionByNicCount={data.vms.distributionByNicCount}
          isExportMode
          exportView={exportView}
          graphOnly
        />
      ),
    })),
  );

  return jobs;
};
