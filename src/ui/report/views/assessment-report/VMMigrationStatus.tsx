import type { IssuesBreakdown } from "@openshift-migration-advisor/planner-sdk";
import {
  CardEmptyState,
  chartColorFailure,
  chartColorSuccess,
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
import RhUiVirtualMachineIcon from "@patternfly/react-icons/dist/esm/icons/virtual-machine-icon";
import React, { useState } from "react";

import IssuesBreakdownChart from "../../../core/components/IssuesBreakdownChart";
import {
  dashboardCard,
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
}

export const VMMigrationStatus: React.FC<VmMigrationStatusProps> = ({
  data,
  issuesBreakdown,
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

  const chartId = "vm-migration-status";
  const chartTitle = `VM migration status — ${VIEW_MODE_LABELS[viewMode]}`;

  return (
    <ChartExportSurface
      id={chartId}
      title={chartTitle}
      exportViews={chartExportViewsFromLabels(
        "VM migration status",
        VIEW_MODE_LABELS,
      )}
      activeExportViewId={viewMode}
      onExportViewChange={(viewId) => setViewMode(viewId as ViewMode)}
    >
      <Card
        className={dashboardCard}
        style={{
          height: "340px !important",
          overflow: "hidden",
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
            </ChartHeaderActions>
          </Flex>
        </CardTitle>
        <CardBody>
          {viewMode === "issuesVsNoIssues" ? (
            donutData.length === 0 ? (
              <CardEmptyState
                title={REPORT_CARD_EMPTY_STATE_TITLES.migrationStatus}
              />
            ) : (
              <MigrationDonutChart
                legendVariant="chart"
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
              />
            )
          ) : issuesBreakdown ? (
            <IssuesBreakdownChart
              issuesBreakdown={issuesBreakdown}
              showTotalsNote
            />
          ) : (
            <CardEmptyState
              title={REPORT_CARD_EMPTY_STATE_TITLES.issuesBreakdown}
            />
          )}
        </CardBody>
      </Card>
    </ChartExportSurface>
  );
};
