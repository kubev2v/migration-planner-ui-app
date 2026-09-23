import type { VMs } from "@openshift-migration-advisor/planner-sdk";
import type { OSDistributionEntry } from "@openshift-migration-advisor/shared-components";

/**
 * Map inventory OS fields into the shape {@link OSDistribution} expects.
 */
export const buildOsDistributionData = (
  vms: VMs,
): Record<string, OSDistributionEntry> =>
  vms.osInfo
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
            supported: true,
            upgradeRecommendation: "",
          };
          return acc;
        },
        {} as Record<string, OSDistributionEntry>,
      );
