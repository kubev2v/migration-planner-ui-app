import type { ComplexityOSNameEntry } from "@openshift-migration-advisor/planner-sdk";

export const OS_CHART_MAX_BARS = 20;

export const sortComplexityOsData = (
  data: ComplexityOSNameEntry[],
): ComplexityOSNameEntry[] =>
  [...data].sort((a, b) => {
    if (a.score === 0 && b.score !== 0) return 1;
    if (b.score === 0 && a.score !== 0) return -1;
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return b.vmCount - a.vmCount;
  });

export const limitOsChartData = (
  data: ComplexityOSNameEntry[],
): ComplexityOSNameEntry[] => data.slice(0, OS_CHART_MAX_BARS);
