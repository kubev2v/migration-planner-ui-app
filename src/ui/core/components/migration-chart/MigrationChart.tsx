import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Tooltip,
} from "@patternfly/react-core";
import { chart_color_blue_300 } from "@patternfly/react-tokens/dist/esm/chart_color_blue_300";
import { chart_color_red_orange_400 } from "@patternfly/react-tokens/dist/esm/chart_color_red_orange_400";
import React, { useMemo } from "react";

import { themeTooltipFlyoutProps } from "../../../../lib/patternfly/flyoutAppendTo";
import { MigrationChartTable } from "./MigrationChartTable";
import {
  chartScrollContainer,
  chartScrollContainerAuto,
  legendLabelWithTooltip,
  legendSwatch,
} from "./styles";
import type { DLength, OSData } from "./types";

interface MigrationChartProps {
  data: OSData[];
  legend?: Record<string, string>;
  legendTooltips?: Record<string, string>;
  dataLength?: DLength;
  maxHeight?: string;
  barHeight?: number;
}

const legendColors = [
  chart_color_blue_300.value,
  chart_color_red_orange_400.value,
  "#f0ad4e",
  "#6a6e73",
];

const MigrationChart: React.FC<MigrationChartProps> = ({
  data,
  legend,
  legendTooltips,
  dataLength = 40,
  maxHeight = "200px",
  barHeight = 8,
}: MigrationChartProps) => {
  const dynamicLegend = useMemo<Record<string, string>>(() => {
    const legendMap: Record<string, string> = {};
    const seen = new Set<string>();

    data.forEach((item) => {
      const key = item.legendCategory;
      if (!seen.has(key)) {
        seen.add(key);
        legendMap[key] = legendColors[seen.size - 1] ?? legendColors[0];
      }
    });

    return legendMap;
  }, [data]);

  const sumOfAllCounts = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return (
      data
        .filter((item) => !item.isGroupHeader)
        .reduce((sum, item) => sum + item.count, 0) || 1
    );
  }, [data]);

  const chartLegend = legend ?? dynamicLegend;
  const getColor = (name: string): string =>
    chartLegend[name] ?? legendColors[0];

  const renderLegendLabel = (label: string): React.ReactNode => {
    const tooltip = legendTooltips?.[label];
    if (!tooltip) {
      return <Content component={ContentVariants.small}>{label}</Content>;
    }

    return (
      <Tooltip {...themeTooltipFlyoutProps} content={tooltip}>
        <Content
          component={ContentVariants.small}
          className={legendLabelWithTooltip}
        >
          {label}
        </Content>
      </Tooltip>
    );
  };

  const isAutoHeight = maxHeight.includes("auto");

  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsLg" }}
    >
      <FlexItem data-testid="migration-chart-legend">
        <Flex
          spaceItems={{ default: "spaceItemsLg" }}
          justifyContent={{ default: "justifyContentFlexEnd" }}
        >
          {Object.entries(chartLegend).map(([key, color]) => (
            <FlexItem key={key}>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
              >
                <FlexItem>
                  <div
                    className={legendSwatch}
                    style={{ backgroundColor: color }}
                  />
                </FlexItem>
                <FlexItem>{renderLegendLabel(key)}</FlexItem>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </FlexItem>
      <FlexItem>
        <Flex
          direction={{ default: "column" }}
          spaceItems={{ default: "spaceItemsMd" }}
        >
          <div
            className={
              isAutoHeight ? chartScrollContainerAuto : chartScrollContainer
            }
            style={isAutoHeight ? undefined : { maxHeight }}
          >
            <MigrationChartTable
              data={data}
              dataLength={dataLength}
              barHeight={barHeight}
              sumOfAllCounts={sumOfAllCounts}
              getColor={getColor}
            />
          </div>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

MigrationChart.displayName = "MigrationChart";

export default MigrationChart;
