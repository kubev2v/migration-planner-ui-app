import { chart_color_blue_300 } from "@patternfly/react-tokens/dist/esm/chart_color_blue_300";
import { chart_color_yellow_300 } from "@patternfly/react-tokens/dist/esm/chart_color_yellow_300";

/**
 * PatternFly chart color semantics (https://www.patternfly.org/charts/colors-for-charts/design-guidelines/#best-practices):
 *   Blue  → success / migratable / supported
 *   Yellow → failure / non-migratable / unsupported
 */
export const chartColorSuccess = chart_color_blue_300.value;
export const chartColorFailure = chart_color_yellow_300.value;

export const ISSUE_CATEGORY_ORDER = [
  "Critical",
  "Error",
  "Warning",
  "Information",
  "Advisory",
] as const;

export const ISSUE_CATEGORY_COLORS: Record<string, string> = {
  Critical: "#0066cc",
  Error: "#5e40be",
  Warning: "#b6a6e9",
  Information: "#73c5c5",
  Advisory: "#b98412",
};

export const REPORT_CARD_EMPTY_STATE_TITLES = {
  networks: "Network data not collected",
  nicCount: "NIC count data not collected",
  hosts: "Host data not collected",
  cpuMemory: "CPU and memory data not collected",
  cpu: "CPU data not collected",
  memory: "Memory data not collected",
  storage: "Storage data not collected",
  diskTypes: "Disk type data not collected",
  clusters: "Cluster data not collected",
  cpuOvercommitment: "CPU overcommitment data not collected",
  operatingSystems: "Operating system data not collected",
  migrationStatus: "Migration status data not collected",
  issuesBreakdown: "Issues breakdown data not collected",
} as const;
