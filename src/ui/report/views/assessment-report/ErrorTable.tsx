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
import { RhUiErrorFillIcon } from "@patternfly/react-icons";
import { t_global_icon_color_status_danger_default as globalDangerColor100 } from "@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default";
import React from "react";

import { ReportTable } from "../ReportTable";
import { dashboardCard } from "./styles";

interface ErrorTableProps {
  errors?: MigrationIssue[];
}

export const ErrorTable: React.FC<ErrorTableProps> = ({ errors = [] }) => {
  const chartId = "errors-table";
  const chartTitle = "Errors";

  return (
    <ChartExportSurface id={chartId} title={chartTitle}>
      <Card className={dashboardCard}>
        <CardTitle>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              <RhUiErrorFillIcon color={globalDangerColor100.var} /> Errors
            </FlexItem>
            <ChartHeaderActions chartId={chartId} title={chartTitle} />
          </Flex>
        </CardTitle>
        <CardBody style={{ padding: 0 }}>
          {errors.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "var(--pf-t--global--text--color--subtle)",
                fontStyle: "italic",
              }}
            >
              No errors found
            </div>
          ) : (
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
                data={errors}
                columns={["Description", "Total VMs"]}
                fields={["assessment", "count"]}
                withoutBorder
              />
            </div>
          )}
        </CardBody>
      </Card>
    </ChartExportSurface>
  );
};
