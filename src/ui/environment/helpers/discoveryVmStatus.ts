import type { Agent } from "@openshift-migration-advisor/planner-sdk";

import type { SourceModel } from "../../../models/SourceModel";

/** Filter key for not-connected sources with manual inventory upload. */
export const DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED =
  "not-connected-uploaded" as const;

export type DiscoveryVmStatusFilterKey =
  typeof DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED | Agent["status"];

/** User-visible Discovery VM status label (matches {@link AgentStatusView}). */
export const getDiscoveryVmStatusLabel = (
  status: Agent["status"],
  uploadedManually = false,
): string => {
  switch (status) {
    case "not-connected":
      return uploadedManually ? "Uploaded manually" : "Not connected";
    case "waiting-for-credentials":
      return "Waiting for credentials";
    case "gathering-initial-inventory":
      return "Gathering inventory";
    case "error":
      return "Error";
    case "up-to-date":
      return "Ready";
    case "source-gone":
      return "Source removed";
  }
};

/** Filter dropdown options derived from {@link getDiscoveryVmStatusLabel}. */
export const DISCOVERY_VM_STATUS_FILTER_OPTIONS: {
  key: DiscoveryVmStatusFilterKey;
  label: string;
}[] = [
  {
    key: DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED,
    label: getDiscoveryVmStatusLabel("not-connected", true),
  },
  {
    key: "not-connected",
    label: getDiscoveryVmStatusLabel("not-connected", false),
  },
  ...(
    [
      "waiting-for-credentials",
      "gathering-initial-inventory",
      "error",
      "up-to-date",
      "source-gone",
    ] as const
  ).map((status) => ({
    key: status,
    label: getDiscoveryVmStatusLabel(status),
  })),
];

export const isInventoryUploadedManually = (source: SourceModel): boolean =>
  Boolean(source.onPremises) &&
  source.inventory !== undefined &&
  source.displayStatus === "not-connected";

export const isSourceUploadedManually = (source: SourceModel): boolean =>
  Boolean(source.onPremises) && source.inventory !== undefined;

export const getSourceDiscoveryVmStatusLabel = (source: SourceModel): string =>
  getDiscoveryVmStatusLabel(
    source.displayStatus,
    isInventoryUploadedManually(source),
  );

export const sourceMatchesDiscoveryVmStatusFilter = (
  source: SourceModel,
  filterKey: DiscoveryVmStatusFilterKey,
): boolean => {
  switch (filterKey) {
    case DISCOVERY_VM_STATUS_FILTER_NOT_CONNECTED_UPLOADED:
      return isInventoryUploadedManually(source);
    case "not-connected":
      return (
        source.displayStatus === "not-connected" &&
        !isSourceUploadedManually(source)
      );
    case "waiting-for-credentials":
    case "gathering-initial-inventory":
    case "error":
    case "up-to-date":
    case "source-gone":
      return source.displayStatus === filterKey;
    default:
      return false;
  }
};
