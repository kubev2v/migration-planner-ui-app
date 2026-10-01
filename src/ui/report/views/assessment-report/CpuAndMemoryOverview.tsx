import {
  CardEmptyState,
  ChartExportSurface,
  chartExportViewsFromLabels,
  ChartHeaderActions,
  MigrationDonutChart,
  REPORT_CARD_EMPTY_STATE_TITLES,
} from "@openshift-migration-advisor/shared-components";
import {
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import React, { useMemo, useState } from "react";

import { dashboardCard } from "./styles";

interface CpuAndMemoryOverviewProps {
  cpuTierDistribution?: Record<string, number>;
  memoryTierDistribution?: Record<string, number>;
  memoryTotalGB?: number;
  cpuTotalCores?: number;
}

type ViewMode = "memoryTiers" | "vcpuTiers";

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  memoryTiers: "VM distribution by memory size tier",
  vcpuTiers: "VM distribution by vCPU count tier",
};

const colorPalette = [
  "#0066cc",
  "#5e40be",
  "#b6a6e9",
  "#73c5c5",
  "#b98412",
  "#28a745",
  "#f0ad4e",
  "#d9534f",
  "#009596",
  "#6a6e73",
];

type DonutSlice = {
  name: string;
  count: number;
  countDisplay: string;
  legendCategory: string;
};

function buildLegend(categories: string[]): Record<string, string> {
  const legendMap: Record<string, string> = {};
  categories.forEach((cat, idx) => {
    legendMap[cat] = colorPalette[idx % colorPalette.length];
  });
  return legendMap;
}

function parseDistributionToSlices(
  distribution?: Record<string, number>,
): DonutSlice[] {
  if (!distribution || Object.keys(distribution).length === 0) return [];
  type Parsed = { label: string; min: number; order: number; count: number };
  const parsed: Parsed[] = Object.entries(distribution).map(
    ([label, count]) => {
      const normalized = label.trim().replace(/\s*–\s*/g, "-");
      const range = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
      const plus = normalized.match(/^(\d+)\s*\+$/);
      const min = range ? Number(range[1]) : plus ? Number(plus[1]) : 0;
      const order = Number.isFinite(min) ? min : Number.MAX_SAFE_INTEGER;
      return { label, min, order, count: Number(count ?? 0) };
    },
  );
  const ordered = parsed
    .sort((a, b) => a.order - b.order)
    .filter((p) => p.count > 0);
  return ordered.map((p) => ({
    name: p.label,
    count: p.count,
    countDisplay: `${p.count} VMs`,
    legendCategory: p.label,
  }));
}

export const CpuAndMemoryOverview: React.FC<CpuAndMemoryOverviewProps> = ({
  cpuTierDistribution,
  memoryTierDistribution,
  memoryTotalGB,
  cpuTotalCores,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("memoryTiers");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const memorySlices = useMemo(() => {
    const base = parseDistributionToSlices(memoryTierDistribution);
    return base.map((s) => ({
      ...s,
      name: /gb$/i.test(s.name.trim()) ? s.name : `${s.name} GB`,
    }));
  }, [memoryTierDistribution]);
  const vcpuSlices = useMemo(() => {
    const base = parseDistributionToSlices(cpuTierDistribution);
    return base.map((s) => ({
      ...s,
      name: /cores?$/i.test(s.name.trim()) ? s.name : `${s.name} cores`,
    }));
  }, [cpuTierDistribution]);

  const activeSlices = viewMode === "memoryTiers" ? memorySlices : vcpuSlices;
  const legend = useMemo(
    () => buildLegend(activeSlices.map((s) => s.legendCategory)),
    [activeSlices],
  );

  const totals = useMemo(() => {
    const sumCounts = (slices: DonutSlice[]): number =>
      slices.reduce((acc, s) => acc + (Number(s.count) || 0), 0);
    return {
      totalVMs:
        viewMode === "memoryTiers"
          ? sumCounts(memorySlices)
          : sumCounts(vcpuSlices),
    };
  }, [viewMode, memorySlices, vcpuSlices]);

  const onDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ): void => {
    if (value === "memoryTiers" || value === "vcpuTiers") {
      setViewMode(value);
    }
    setIsDropdownOpen(false);
  };

  const chartId = "cpu-memory-overview";
  const chartTitle = `CPU & memory — ${VIEW_MODE_LABELS[viewMode]}`;

  return (
    <ChartExportSurface
      id={chartId}
      title={chartTitle}
      exportViews={chartExportViewsFromLabels("CPU & memory", VIEW_MODE_LABELS)}
      activeExportViewId={viewMode}
      onExportViewChange={(viewId) => setViewMode(viewId as ViewMode)}
    >
      <Card className={dashboardCard} style={{ overflow: "hidden" }}>
        <CardTitle>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
            style={{ width: "100%" }}
          >
            <FlexItem>
              <div>
                <div style={{ paddingTop: "0.32rem" }}>
                  <i className="fas fa-microchip" /> CPU &amp; memory
                </div>
                <div
                  style={{
                    color: "var(--pf-t--global--text--color--subtle)",
                    fontSize: "0.85rem",
                  }}
                >
                  {viewMode === "memoryTiers"
                    ? "Memory size tiers"
                    : "vCPU count tiers"}
                </div>
              </div>
            </FlexItem>
            <ChartHeaderActions chartId={chartId} title={chartTitle}>
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onSelect}
                onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onDropdownToggle}
                    isExpanded={isDropdownOpen}
                    style={{ minWidth: "290px" }}
                  >
                    {VIEW_MODE_LABELS[viewMode]}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="memoryTiers" value="memoryTiers">
                    VM distribution by memory size tier
                  </DropdownItem>
                  <DropdownItem key="vcpuTiers" value="vcpuTiers">
                    VM distribution by vCPU count tier
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ChartHeaderActions>
          </Flex>
        </CardTitle>
        <CardBody>
          {activeSlices.length === 0 ? (
            <CardEmptyState
              title={
                viewMode === "memoryTiers"
                  ? REPORT_CARD_EMPTY_STATE_TITLES.memory
                  : REPORT_CARD_EMPTY_STATE_TITLES.cpu
              }
            />
          ) : (
            <MigrationDonutChart
              legendVariant="chart"
              data={activeSlices}
              height={300}
              width={420}
              donutThickness={18}
              titleFontSize={34}
              legend={legend}
              title={`${totals.totalVMs} VMs`}
              subTitle={
                viewMode === "memoryTiers"
                  ? typeof memoryTotalGB === "number"
                    ? `${memoryTotalGB} GB`
                    : undefined
                  : typeof cpuTotalCores === "number"
                    ? `${cpuTotalCores.toLocaleString()} Cores`
                    : undefined
              }
              subTitleColor="var(--pf-t--global--text--color--subtle)"
              itemsPerRow={Math.ceil(activeSlices.length / 2)}
              labelFontSize={18}
              marginLeft="52%"
              tooltipLabelFormatter={({ datum, percent }) =>
                `${datum.countDisplay}\n${percent.toFixed(1)}%`
              }
            />
          )}
        </CardBody>
      </Card>
    </ChartExportSurface>
  );
};

CpuAndMemoryOverview.displayName = "CpuAndMemoryOverview";

export default CpuAndMemoryOverview;
