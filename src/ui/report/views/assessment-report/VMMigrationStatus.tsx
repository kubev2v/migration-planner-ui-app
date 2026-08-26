import type { IssuesBreakdown } from "@openshift-migration-advisor/planner-sdk";
import {
  CardEmptyState,
  chartColorFailure,
  chartColorSuccess,
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
import MigrationDonutChart from "../../../core/components/MigrationDonutChart";
import { DashboardExportSection } from "./DashboardExportSection";
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

  const renderBreakdownChart = (showTotalsNote: boolean): React.ReactNode =>
    issuesBreakdown ? (
      <IssuesBreakdownChart
        issuesBreakdown={issuesBreakdown}
        isExportMode={isExportMode}
        showTotalsNote={showTotalsNote}
      />
    ) : (
      <CardEmptyState title={REPORT_CARD_EMPTY_STATE_TITLES.issuesBreakdown} />
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
            <DashboardExportSection
              title={VIEW_MODE_LABELS.issuesVsNoIssues}
              withMargin
            >
              {renderDonutChart()}
            </DashboardExportSection>
            <DashboardExportSection title={VIEW_MODE_LABELS.issuesBreakdown}>
              {renderBreakdownChart(false)}
            </DashboardExportSection>
          </>
        ) : viewMode === "issuesVsNoIssues" ? (
          renderDonutChart()
        ) : (
          renderBreakdownChart(true)
        )}
      </CardBody>
    </Card>
  );
};
