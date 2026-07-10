import { css } from "@emotion/css";
import type { IssuesBreakdown } from "@openshift-migration-advisor/planner-sdk";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import React, { useMemo } from "react";

const ISSUE_CATEGORY_ORDER = [
  "Critical",
  "Error",
  "Warning",
  "Information",
  "Advisory",
] as const;

const ISSUE_CATEGORY_COLORS: Record<string, string> = {
  Critical: "#0066cc",
  Error: "#5e40be",
  Warning: "#b6a6e9",
  Information: "#73c5c5",
  Advisory: "#b98412",
};

const chartWrapper = css`
  display: flex;
  justify-content: center;
`;

const barColumn = css`
  flex: 1;
  max-width: 120px;
`;

const barTrack = css`
  display: flex;
  align-items: flex-end;
  width: 100%;
  justify-content: center;
`;

const bar = css`
  width: 60px;
  transition: height 0.3s ease;
  border-radius: 4px 4px 0 0;
`;

const barLabel = css`
  font-size: 12px;
  text-align: center;
  word-break: break-word;
  color: var(--pf-t--global--text--color--regular);
`;

const totalsNote = css`
  font-size: 12px;
  color: var(--pf-t--global--text--color--subtle);
  margin-top: 16px;
  text-align: center;
  display: block;
`;

interface IssuesBreakdownChartProps {
  issuesBreakdown: IssuesBreakdown;
  isExportMode?: boolean;
  showTotalsNote?: boolean;
}

const IssuesBreakdownChart: React.FC<IssuesBreakdownChartProps> = ({
  issuesBreakdown,
  isExportMode = false,
  showTotalsNote = true,
}) => {
  const breakdownData = useMemo(
    () =>
      ISSUE_CATEGORY_ORDER.map((category) => ({
        name: category,
        count:
          issuesBreakdown[category.toLowerCase() as keyof IssuesBreakdown] ?? 0,
      })),
    [issuesBreakdown],
  );

  const maxCount = useMemo(() => {
    return breakdownData.length > 0
      ? Math.max(...breakdownData.map((item) => item.count))
      : 0;
  }, [breakdownData]);

  const barTrackHeight = isExportMode ? 140 : 200;
  const chartHeight = isExportMode ? "180px" : "250px";

  return (
    <div>
      <div className={chartWrapper}>
        <Flex
          direction={{ default: "row" }}
          alignItems={{ default: "alignItemsFlexEnd" }}
          justifyContent={{ default: "justifyContentCenter" }}
          spaceItems={{ default: "spaceItemsMd" }}
          style={{ height: chartHeight, width: "100%" }}
        >
          {breakdownData.map((item) => {
            const heightPercentage =
              maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const minHeightPercentage = item.count > 0 ? 20 : 0;
            const finalHeightPercentage = Math.max(
              heightPercentage,
              minHeightPercentage,
            );
            const barColor =
              ISSUE_CATEGORY_COLORS[item.name] ??
              ISSUE_CATEGORY_COLORS.Critical;

            return (
              <Flex
                key={item.name}
                direction={{ default: "column" }}
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
                className={barColumn}
              >
                <FlexItem
                  className={barTrack}
                  style={{ height: `${barTrackHeight}px` }}
                >
                  <div
                    className={bar}
                    style={{
                      height: `${finalHeightPercentage}%`,
                      backgroundColor: barColor,
                    }}
                    title={`${item.name}: ${item.count} VMs`}
                  />
                </FlexItem>
                <FlexItem>
                  <Content component="small" className={barLabel}>
                    {item.name}
                    <br />({item.count} VMs)
                  </Content>
                </FlexItem>
              </Flex>
            );
          })}
        </Flex>
      </div>
      {showTotalsNote && (
        <Content component="small" className={totalsNote}>
          Totals may exceed the unique VM count because a VM can appear in
          multiple categories
        </Content>
      )}
    </div>
  );
};

IssuesBreakdownChart.displayName = "IssuesBreakdownChart";

export default IssuesBreakdownChart;
