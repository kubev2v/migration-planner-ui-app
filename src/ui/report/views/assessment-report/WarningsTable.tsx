import type { MigrationIssue } from "@openshift-migration-advisor/planner-sdk";
import {
  chartExportScrollProps,
  ChartExportSurface,
  ChartHeaderActions,
} from "@openshift-migration-advisor/shared-components";
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { RhUiWarningFillIcon } from "@patternfly/react-icons";
import { t_global_icon_color_status_warning_default as globalWarningColor100 } from "@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default";
import React from "react";

import { ReportTable } from "../ReportTable";
import { dashboardCard } from "./styles";

interface WarningsTableProps {
  warnings: MigrationIssue[];
}

export const WarningsTable: React.FC<WarningsTableProps> = ({ warnings }) => {
  const chartId = "warnings-table";
  const chartTitle = "Warnings";

  return (
    <ChartExportSurface id={chartId} title={chartTitle}>
      <Card className={dashboardCard}>
        <CardTitle>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              <RhUiWarningFillIcon color={globalWarningColor100.var} /> Warnings
            </FlexItem>
            <ChartHeaderActions chartId={chartId} title={chartTitle} />
          </Flex>
        </CardTitle>
        <CardBody style={{ padding: 0 }}>
          <div
            {...chartExportScrollProps}
            style={{
              maxHeight: "325px",
              overflowY: "auto",
              overflowX: "auto",
              padding: 2,
            }}
          >
            <ReportTable<MigrationIssue>
              data={warnings}
              columns={["Description", "Total VMs"]}
              fields={["assessment", "count"]}
              withoutBorder
            />
          </div>
        </CardBody>
      </Card>
    </ChartExportSurface>
  );
};
