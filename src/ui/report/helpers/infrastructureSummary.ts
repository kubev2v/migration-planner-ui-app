import type {
  Host,
  Infra,
  InventoryData,
  Network,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";

import { compareClustersByVmCount } from "./clusterViewModel";

export type FeatureStatus = "enabled" | "disabled" | "unknown";

export type InfrastructureSummaryModel = {
  vmwareVersion: string;
  datacenters: number | undefined;
  vCenters: number | undefined;
  esxiHosts: number | undefined;
};

export type NetworkLabel = {
  name: string;
  vlanId?: string;
  displayName: string;
};

export type ClusterDetailRow = {
  id: string;
  name: string;
  hosts: number;
  vms: number;
  vmotion: FeatureStatus;
  drs: FeatureStatus;
  vsan: FeatureStatus;
};

export type ClusterDetailsModel = {
  hosts: number;
  vms: number;
  networksDetected: number;
  vmotion: FeatureStatus;
  drs: FeatureStatus;
  ha: FeatureStatus;
  vsan: FeatureStatus;
  networks: NetworkLabel[];
};

const VSAN_TYPE_PATTERN = /vsan/i;

export const formatVSphereVersion = (version?: string): string => {
  if (!version?.trim()) {
    return "—";
  }

  const withoutPrefix = version.trim().replace(/^vSphere\s+/i, "");
  const parts = withoutPrefix.split(".");
  while (parts.length > 3 && parts[parts.length - 1] === "0") {
    parts.pop();
  }

  return `vSphere ${parts.join(".")}`;
};

export const booleanToFeatureStatus = (
  value: boolean | undefined,
): FeatureStatus => {
  if (value === true) {
    return "enabled";
  }
  if (value === false) {
    return "disabled";
  }
  return "unknown";
};

export const hostCapabilityStatus = (
  hosts: Host[] | undefined,
  capability: keyof Pick<Host, "vmotionSupported" | "storageVmotionSupported">,
): FeatureStatus => {
  if (!hosts || hosts.length === 0) {
    return "unknown";
  }

  const known = hosts
    .map((host) => host[capability])
    .filter((value): value is boolean => typeof value === "boolean");

  if (known.length === 0) {
    return "unknown";
  }

  return known.some(Boolean) ? "enabled" : "disabled";
};

export const vsanStatus = (infra?: Infra, vms?: VMs): FeatureStatus => {
  const datastoreMatch = infra?.datastores?.some((datastore) =>
    VSAN_TYPE_PATTERN.test(datastore.type),
  );
  const diskTypeMatch = Object.keys(vms?.diskTypes ?? {}).some((type) =>
    VSAN_TYPE_PATTERN.test(type),
  );

  if (datastoreMatch || diskTypeMatch) {
    return "enabled";
  }

  if (infra?.datastores || vms?.diskTypes) {
    return "disabled";
  }

  return "unknown";
};

const hostCount = (infra?: Infra): number | undefined => {
  if (typeof infra?.totalHosts === "number") {
    return infra.totalHosts;
  }
  if (infra?.hosts) {
    return infra.hosts.length;
  }
  return undefined;
};

const datacenterCount = (infra?: Infra): number | undefined => {
  if (typeof infra?.totalDatacenters === "number") {
    return infra.totalDatacenters;
  }
  if (infra?.clustersPerDatacenter && infra.clustersPerDatacenter.length > 0) {
    return infra.clustersPerDatacenter.length;
  }
  return undefined;
};

export const countVCenters = (
  clusters?: { [key: string]: InventoryData },
  vcenterId?: string,
): number | undefined => {
  const ids = new Set<string>();
  if (vcenterId) {
    ids.add(vcenterId);
  }
  Object.values(clusters ?? {}).forEach((cluster) => {
    if (cluster.vcenter?.id) {
      ids.add(cluster.vcenter.id);
    }
  });
  return ids.size > 0 ? ids.size : undefined;
};

const toNetworkLabel = (network: Network): NetworkLabel => {
  const vlanId = network.vlanId?.trim();
  return {
    name: network.name,
    vlanId: vlanId || undefined,
    displayName: vlanId ? `${network.name} (VLAN ${vlanId})` : network.name,
  };
};

export const visibleNetworks = (infra?: Infra): NetworkLabel[] =>
  (infra?.networks ?? [])
    .filter(
      (network) => Boolean(network.name?.trim()) && network.type !== "dvswitch",
    )
    .map(toNetworkLabel);

export const buildInfrastructureSummary = ({
  infra,
  vcenterVersion,
  vcenterId,
  clusters,
}: {
  infra?: Infra;
  vcenterVersion?: string;
  vcenterId?: string;
  clusters?: { [key: string]: InventoryData };
}): InfrastructureSummaryModel => ({
  vmwareVersion: formatVSphereVersion(vcenterVersion),
  datacenters: datacenterCount(infra),
  vCenters: countVCenters(clusters, vcenterId),
  esxiHosts: hostCount(infra),
});

const clusterFeatureStatus = (
  cluster: InventoryData,
): Pick<ClusterDetailRow, "vmotion" | "drs" | "vsan"> & {
  ha: FeatureStatus;
} => ({
  vmotion: hostCapabilityStatus(cluster.infra?.hosts, "vmotionSupported"),
  drs: booleanToFeatureStatus(cluster.clusterFeatures?.drsEnabled),
  ha: booleanToFeatureStatus(cluster.clusterFeatures?.haEnabled),
  vsan: vsanStatus(cluster.infra, cluster.vms),
});

export const buildClusterDetailRows = (clusters?: {
  [key: string]: InventoryData;
}): ClusterDetailRow[] => {
  if (!clusters) {
    return [];
  }

  return Object.keys(clusters)
    .sort((a, b) => compareClustersByVmCount(a, b, clusters))
    .map((id) => {
      const cluster = clusters[id];
      const features = clusterFeatureStatus(cluster);
      return {
        id,
        name: id,
        hosts: hostCount(cluster.infra) ?? 0,
        vms: cluster.vms?.total ?? 0,
        vmotion: features.vmotion,
        drs: features.drs,
        vsan: features.vsan,
      };
    });
};

export const buildClusterDetails = (
  cluster?: InventoryData,
): ClusterDetailsModel | undefined => {
  if (!cluster) {
    return undefined;
  }

  const networks = visibleNetworks(cluster.infra);
  const features = clusterFeatureStatus(cluster);

  return {
    hosts: hostCount(cluster.infra) ?? 0,
    vms: cluster.vms?.total ?? 0,
    networksDetected: networks.length,
    vmotion: features.vmotion,
    drs: features.drs,
    ha: features.ha,
    vsan: features.vsan,
    networks,
  };
};
