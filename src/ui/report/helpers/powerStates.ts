import type { MigrationDonutChartDatum } from "@openshift-migration-advisor/shared-components";

export type PowerStateChartModel = {
  slices: MigrationDonutChartDatum[];
  legend: Record<string, string>;
  total: number;
};

const HOST_POWER_CATEGORIES = [
  "Powered on",
  "Powered off",
  "Standby",
  "Not responding",
  "Maintenance",
] as const;

type HostPowerCategory = (typeof HOST_POWER_CATEGORIES)[number];

const HOST_POWER_KEY_ALIASES: Record<string, HostPowerCategory> = {
  poweredon: "Powered on",
  powered_on: "Powered on",
  green: "Powered on",
  poweredoff: "Powered off",
  powered_off: "Powered off",
  standby: "Standby",
  stand_by: "Standby",
  notresponding: "Not responding",
  not_responding: "Not responding",
  gray: "Not responding",
  grey: "Not responding",
  red: "Not responding",
  maintenance: "Maintenance",
  inmaintenance: "Maintenance",
  inmaintenancemode: "Maintenance",
};

export const HOST_POWER_COLORS: Record<string, string> = {
  "Powered on": "#0066cc",
  "Powered off": "#dca614",
  Standby: "#f0ab00",
  "Not responding": "#c9190b",
  Maintenance: "#002f5d",
};

const VM_POWER_CATEGORIES = ["Powered off", "Powered on", "Suspended"] as const;

type VmPowerCategory = (typeof VM_POWER_CATEGORIES)[number];

const VM_POWER_KEY_ALIASES: Record<string, VmPowerCategory> = {
  poweredoff: "Powered off",
  powered_off: "Powered off",
  poweredon: "Powered on",
  powered_on: "Powered on",
  suspended: "Suspended",
};

export const VM_POWER_COLORS: Record<string, string> = {
  "Powered off": "#0066cc",
  "Powered on": "#dca614",
  Suspended: "#5e40be",
};

const OTHER_COLOR = "#6a6e73";

const normalizeKey = (key: string): string =>
  key
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");

const formatUnknownLabel = (key: string): string => {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  if (!spaced) {
    return "Unknown";
  }
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const toSlice = (
  name: string,
  count: number,
  unit: string,
): MigrationDonutChartDatum => ({
  name,
  count,
  legendCategory: name,
  countDisplay: `${count} ${count === 1 ? unit.replace(/s$/, "") : unit}`,
});

const sumCounts = (counts: Record<string, number>): number =>
  Object.values(counts).reduce((total, count) => total + (count || 0), 0);

export const buildHostPowerStateChart = (
  hostPowerStates?: Record<string, number>,
): PowerStateChartModel => {
  const counts: Record<string, number> = Object.fromEntries(
    HOST_POWER_CATEGORIES.map((category) => [category, 0]),
  );

  Object.entries(hostPowerStates ?? {}).forEach(([key, count]) => {
    const mapped = HOST_POWER_KEY_ALIASES[normalizeKey(key)];
    const label = mapped ?? formatUnknownLabel(key);
    counts[label] = (counts[label] ?? 0) + (count || 0);
  });

  const orderedLabels = [
    ...HOST_POWER_CATEGORIES,
    ...Object.keys(counts).filter(
      (label) => !HOST_POWER_CATEGORIES.includes(label as HostPowerCategory),
    ),
  ];

  const slices = orderedLabels.map((label) =>
    toSlice(label, counts[label] ?? 0, "hosts"),
  );

  const legend: Record<string, string> = {};
  orderedLabels.forEach((label) => {
    legend[label] = HOST_POWER_COLORS[label] ?? OTHER_COLOR;
  });

  return {
    slices,
    legend,
    total: sumCounts(counts),
  };
};

export const buildVmPowerStateChart = (
  powerStates?: Record<string, number>,
): PowerStateChartModel => {
  const counts: Record<string, number> = {
    "Powered off": 0,
    "Powered on": 0,
  };

  Object.entries(powerStates ?? {}).forEach(([key, count]) => {
    const mapped = VM_POWER_KEY_ALIASES[normalizeKey(key)];
    const label = mapped ?? formatUnknownLabel(key);
    counts[label] = (counts[label] ?? 0) + (count || 0);
  });

  const orderedLabels = [
    ...VM_POWER_CATEGORIES.filter(
      (category) => category !== "Suspended" || (counts[category] ?? 0) > 0,
    ),
    ...Object.keys(counts).filter(
      (label) => !VM_POWER_CATEGORIES.includes(label as VmPowerCategory),
    ),
  ];

  const slices = orderedLabels.map((label) =>
    toSlice(label, counts[label] ?? 0, "VMs"),
  );

  const legend: Record<string, string> = {};
  orderedLabels.forEach((label) => {
    legend[label] = VM_POWER_COLORS[label] ?? OTHER_COLOR;
  });

  return {
    slices,
    legend,
    total: sumCounts(counts),
  };
};
