import type {
  Inventory,
  InventoryData,
  OsInfo,
  VMs,
} from "@openshift-migration-advisor/planner-sdk";
import { OsInfoSupportTierEnum } from "@openshift-migration-advisor/planner-sdk";

const OS_NAME_TIER_MATCHERS: Array<{
  tier: OsInfoSupportTierEnum;
  patterns: RegExp[];
}> = [
  {
    tier: OsInfoSupportTierEnum.Certified,
    patterns: [/red hat enterprise linux/i, /windows server/i],
  },
  {
    tier: OsInfoSupportTierEnum.VendorSupported,
    patterns: [/suse linux/i, /windows 10/i, /windows 11/i],
  },
  {
    tier: OsInfoSupportTierEnum.CommunitySupported,
    patterns: [/centos/i, /fedora/i, /ubuntu/i, /debian/i, /amazon linux/i],
  },
];

/**
 * Maps an example-report guest OS name to a Red Hat support tier so the
 * Operating Systems card can preview Certified, Commercial Vendor Supported,
 * Community supported, and Special handling VMs.
 */
export const getExampleOsSupportTier = (
  osName: string,
): OsInfoSupportTierEnum => {
  for (const { tier, patterns } of OS_NAME_TIER_MATCHERS) {
    if (patterns.some((pattern) => pattern.test(osName))) {
      return tier;
    }
  }

  return OsInfoSupportTierEnum.SpecialHandling;
};

const annotateOsInfo = (
  osInfo: { [key: string]: OsInfo } | undefined,
): { [key: string]: OsInfo } | undefined => {
  if (!osInfo) {
    return osInfo;
  }

  return Object.fromEntries(
    Object.entries(osInfo).map(([osName, info]) => [
      osName,
      { ...info, supportTier: getExampleOsSupportTier(osName) },
    ]),
  );
};

const annotateVms = (vms: VMs): VMs => ({
  ...vms,
  osInfo: annotateOsInfo(vms.osInfo),
});

const annotateInventoryData = (
  data: InventoryData | undefined,
): InventoryData | undefined => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    vms: annotateVms(data.vms),
  };
};

export const annotateExampleInventoryOsSupportTiers = (
  inventory: Inventory,
): Inventory => ({
  ...inventory,
  vcenter: annotateInventoryData(inventory.vcenter),
  clusters: inventory.clusters
    ? Object.fromEntries(
        Object.entries(inventory.clusters).map(([id, data]) => [
          id,
          annotateInventoryData(data) ?? data,
        ]),
      )
    : inventory.clusters,
});
