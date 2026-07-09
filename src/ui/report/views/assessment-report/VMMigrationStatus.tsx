import type { IssuesBreakdown } from "@openshift-migration-advisor/planner-sdk";
import {
  Card,
  CardBody,
  CardTitle,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import RhUiVirtualMachineIcon from "@patternfly/react-icons/dist/esm/icons/virtual-machine-icon";
import React, { useMemo, useState } from "react";

import { CardEmptyState } from "../../../core/components/CardEmptyState";
import MigrationDonutChart from "../../../core/components/MigrationDonutChart";
import {
  chartColorFailure,
  chartColorSuccess,
  ISSUE_CATEGORY_COLORS,
  ISSUE_CATEGORY_ORDER,
  REPORT_CARD_EMPTY_STATE_TITLES,
} from "./constants";
import {
  dashboardCard,
  migrationStatusBar,
  migrationStatusBarColumn,
  migrationStatusBarLabel,
  migrationStatusBarTrack,
  migrationStatusTotalsNote,
  storageChartWrapper,
  storageExportSectionMargin,
  storageExportSectionTitle,
  storageFlexFullWidth,
  storageMenuToggleMinWidth,
} from "./styles";

type ViewMode = "issuesVsNoIssues" | "issuesBreakdown";

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  issuesVsNoIssues: "No issues vs with issues",
  issuesBreakdown: "With issues breakdown",
};

interface VmMigrationStatusProps {
  data: {
    migratable: number;
    nonMigratable: number;
  };
  issuesBreakdown?: IssuesBreakdown;
  isExportMode?: boolean;
  exportAllViews?: boolean;
}

export const VMMigrationStatus: React.FC<VmMigrationStatusProps> = ({
  data,
  issuesBreakdown,
  isExportMode = false,
  exportAllViews = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("issuesVsNoIssues");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const donutData = [
    {
      name: "Migratable",
      count: data.migratable,
      countDisplay: `${data.migratable} VMs`,
      legendCategory: "Migratable",
    },
    {
      name: "Not ready for migration",
      count: data.nonMigratable,
      countDisplay: `${data.nonMigratable} VMs`,
      legendCategory: "Not ready for migration",
    },
  ];

  const legend = {
    Migratable: chartColorSuccess,
    "Not ready for migration": chartColorFailure,
  };

  const breakdownData = useMemo(() => {
    if (!issuesBreakdown) return [];

    return ISSUE_CATEGORY_ORDER.map((category) => ({
      name: category,
      count:
        issuesBreakdown[category.toLowerCase() as keyof IssuesBreakdown] ?? 0,
    }));
  }, [issuesBreakdown]);

  const maxCount = useMemo(() => {
    return breakdownData.length > 0
      ? Math.max(...breakdownData.map((item) => item.count))
      : 0;
  }, [breakdownData]);

  const onDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ): void => {
    if (value === "issuesVsNoIssues" || value === "issuesBreakdown") {
      setViewMode(value);
    }
    setIsDropdownOpen(false);
  };

  const totalVMs = data.migratable + data.nonMigratable;
  const barTrackHeight = isExportMode ? 140 : 200;

  const renderDonutChart = (): React.ReactNode => (
    <MigrationDonutChart
      data={donutData}
      legend={legend}
      height={300}
      width={420}
      donutThickness={18}
      padAngle={1}
      title={`${totalVMs}`}
      subTitle="VMs"
      subTitleColor="var(--pf-t--global--text--color--subtle)"
      titleFontSize={34}
      labelFontSize={18}
      itemsPerRow={2}
      marginLeft="40%"
      emptyStateTitle={REPORT_CARD_EMPTY_STATE_TITLES.migrationStatus}
    />
  );

  const renderBreakdownChart = (showTotalsNote: boolean): React.ReactNode => (
    <div>
      <div className={storageChartWrapper}>
        <Flex
          direction={{ default: "row" }}
          alignItems={{ default: "alignItemsFlexEnd" }}
          justifyContent={{ default: "justifyContentCenter" }}
          spaceItems={{ default: "spaceItemsMd" }}
          style={{
            height: isExportMode ? "180px" : "250px",
            width: "100%",
          }}
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
                className={migrationStatusBarColumn}
              >
                <FlexItem
                  className={migrationStatusBarTrack}
                  style={{ height: `${barTrackHeight}px` }}
                >
                  <div
                    className={migrationStatusBar}
                    style={{
                      height: `${finalHeightPercentage}%`,
                      backgroundColor: barColor,
                    }}
                    title={`${item.name}: ${item.count} VMs`}
                  />
                </FlexItem>
                <FlexItem>
                  <Content
                    component="small"
                    className={migrationStatusBarLabel}
                  >
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
        <Content component="small" className={migrationStatusTotalsNote}>
          Totals may exceed the unique VM count because a VM can appear in
          multiple categories
        </Content>
      )}
    </div>
  );

  return (
    <Card
      className={dashboardCard}
      id="vm-migration-status"
      style={{
        height: isExportMode ? "auto" : "340px !important",
        overflow: isExportMode ? "visible" : "hidden",
      }}
    >
      <CardTitle>
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          className={storageFlexFullWidth}
        >
          <FlexItem>
            <RhUiVirtualMachineIcon /> VM Migration Status
          </FlexItem>
          {!isExportMode && (
            <FlexItem>
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onSelect}
                onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onDropdownToggle}
                    isExpanded={isDropdownOpen}
                    className={storageMenuToggleMinWidth}
                  >
                    {VIEW_MODE_LABELS[viewMode]}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="issuesVsNoIssues" value="issuesVsNoIssues">
                    {VIEW_MODE_LABELS.issuesVsNoIssues}
                  </DropdownItem>
                  <DropdownItem key="issuesBreakdown" value="issuesBreakdown">
                    {VIEW_MODE_LABELS.issuesBreakdown}
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        {isExportMode && exportAllViews ? (
          <>
            <div className={storageExportSectionMargin}>
              <div className={storageExportSectionTitle}>
                {VIEW_MODE_LABELS.issuesVsNoIssues}
              </div>
              {renderDonutChart()}
            </div>
            <div>
              <div className={storageExportSectionTitle}>
                {VIEW_MODE_LABELS.issuesBreakdown}
              </div>
              {issuesBreakdown ? (
                renderBreakdownChart(false)
              ) : (
                <CardEmptyState
                  title={REPORT_CARD_EMPTY_STATE_TITLES.issuesBreakdown}
                />
              )}
            </div>
          </>
        ) : viewMode === "issuesVsNoIssues" ? (
          renderDonutChart()
        ) : !issuesBreakdown ? (
          <CardEmptyState
            title={REPORT_CARD_EMPTY_STATE_TITLES.issuesBreakdown}
          />
        ) : (
          renderBreakdownChart(true)
        )}
      </CardBody>
    </Card>
  );
};
