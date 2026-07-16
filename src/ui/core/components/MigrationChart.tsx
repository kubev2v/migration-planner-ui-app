import { css } from "@emotion/css";
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Popover,
  Tooltip,
} from "@patternfly/react-core";
import { RhUiInformationFillIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { chart_color_blue_300 } from "@patternfly/react-tokens/dist/esm/chart_color_blue_300";
import { chart_color_red_orange_400 } from "@patternfly/react-tokens/dist/esm/chart_color_red_orange_400";
import React, { useMemo } from "react";

import {
  getFlyoutAppendTo,
  themePopoverFlyoutClassName,
  themeTooltipFlyoutProps,
} from "../../../lib/patternfly/flyoutAppendTo";

interface OSData {
  name: string;
  count: number;
  legendCategory: string;
  infoText?: string;
  isGroupHeader?: boolean;
}

interface MigrationChartProps {
  data: OSData[];
  legend?: Record<string, string>;
  legendTooltips?: Record<string, string>;
  dataLength?: DLength;
  maxHeight?: string;
  barHeight?: number;
}

type DLength =
  10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80 | 90 | 100;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const upgradeRecommendationPopoverCloseButton = css`
  .pf-v6-c-popover__close .pf-v6-c-button.pf-m-plain,
  .pf-v6-c-popover__close .pf-v6-c-button.pf-m-plain:hover {
    color: var(--pf-t--global--text--color--regular);
  }
`;

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
  // Ensure tiny percentages still render a visible colored segment
  const MIN_BAR_PX = 3;
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

  // Calculate the sum of all count values to normalize bar widths
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
          style={{
            borderBottom: "1px dotted currentColor",
            cursor: "help",
          }}
        >
          {label}
        </Content>
      </Tooltip>
    );
  };

  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsLg" }}
    >
      {/* Legend */}
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
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: color,
                      borderRadius: "2px",
                    }}
                  />
                </FlexItem>
                <FlexItem>{renderLegendLabel(key)}</FlexItem>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </FlexItem>
      {/* Chart Area */}
      <FlexItem>
        <Flex
          direction={{ default: "column" }}
          spaceItems={{ default: "spaceItemsMd" }}
        >
          <div
            style={{
              maxHeight: maxHeight.includes("auto") ? "none" : maxHeight,
              overflowY: maxHeight.includes("auto") ? "visible" : "auto",
            }}
          >
            <Table variant="compact" borders={false}>
              <Tbody>
                {data.map((item, index) =>
                  item.isGroupHeader ? (
                    <Tr key={`group-${item.legendCategory}`}>
                      <Td
                        colSpan={2}
                        style={{
                          paddingLeft: "0px",
                          paddingTop: index === 0 ? "4px" : "12px",
                          paddingBottom: "4px",
                        }}
                      >
                        <Content
                          component={ContentVariants.p}
                          style={{
                            fontSize: "clamp(0.45rem, 0.75vw, 1.15rem)",
                            fontWeight: 600,
                          }}
                        >
                          {item.name}
                        </Content>
                      </Td>
                      <Td
                        width={10}
                        style={{
                          paddingRight: "0px",
                          textAlign: "center",
                          paddingTop: index === 0 ? "4px" : "12px",
                          paddingBottom: "4px",
                        }}
                      >
                        <Content
                          component="p"
                          style={{
                            fontSize: "clamp(0.45rem, 0.75vw, 1.15rem)",
                            fontWeight: 600,
                          }}
                        >
                          {item.count}
                        </Content>
                      </Td>
                    </Tr>
                  ) : (
                    <Tr key={`${item.legendCategory}-${item.name}`}>
                      <Td
                        width={dataLength}
                        style={{ paddingLeft: "16px", paddingTop: "4px" }}
                      >
                        <Flex
                          alignItems={{ default: "alignItemsCenter" }}
                          spaceItems={{ default: "spaceItemsXs" }}
                          flexWrap={{ default: "nowrap" }}
                        >
                          <FlexItem>
                            <Content
                              component={ContentVariants.p}
                              style={{
                                fontSize: "clamp(0.4rem, 0.7vw, 1.1rem)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                textTransform: "capitalize",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {item.name}
                            </Content>
                          </FlexItem>
                          {item.infoText ? (
                            <FlexItem shrink={{ default: "shrink" }}>
                              <Popover
                                appendTo={getFlyoutAppendTo}
                                className={`${themePopoverFlyoutClassName} ${upgradeRecommendationPopoverCloseButton}`}
                                position="bottom"
                                headerContent="Upgrade to get support"
                                bodyContent={<div>{item.infoText}</div>}
                              >
                                <Button
                                  type="button"
                                  aria-label="Open operating system upgrade information"
                                  variant="plain"
                                  style={{
                                    padding: "0",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <RhUiInformationFillIcon color="var(--pf-t--global--icon--color--status--info--default)" />
                                </Button>
                              </Popover>
                            </FlexItem>
                          ) : null}
                        </Flex>
                      </Td>
                      <Td>
                        {/* Visual Bar */}
                        <div>
                          <div
                            style={{
                              position: "relative",
                              height: `${barHeight}px`,
                              backgroundColor:
                                "var(--pf-t--global--background--color--secondary--default)",
                              overflow: "hidden",
                            }}
                          >
                            {((): React.ReactNode => {
                              const barWidth =
                                sumOfAllCounts > 0
                                  ? (item.count / sumOfAllCounts) * 100
                                  : 0;
                              const hasValue = barWidth > 0;
                              return (
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${barWidth}%`,
                                    minWidth: hasValue
                                      ? `${MIN_BAR_PX}px`
                                      : "0",
                                    backgroundColor: `${getColor(
                                      item.legendCategory,
                                    )}`,
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </Td>
                      <Td
                        width={10}
                        style={{
                          paddingRight: "0px",
                          textAlign: "center",
                          paddingTop: "5px",
                        }}
                      >
                        <Content
                          component="p"
                          style={{ fontSize: "clamp(0.4rem, 0.7vw, 1.1rem)" }}
                        >
                          {item.count}
                        </Content>
                      </Td>
                    </Tr>
                  ),
                )}
              </Tbody>
            </Table>
          </div>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

export default MigrationChart;
