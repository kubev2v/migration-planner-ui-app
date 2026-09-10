import {
  CardEmptyState,
  MigrationDonutChart,
  type MigrationDonutChartDatum,
} from "@openshift-migration-advisor/shared-components";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";
import type { ReactNode } from "react";
import React from "react";

import { dashboardCard } from "./styles";

interface PowerStateCardProps {
  id: string;
  title: string;
  icon: ReactNode;
  emptyTitle: string;
  slices: MigrationDonutChartDatum[];
  legend: Record<string, string>;
  total: number;
  subTitle: string;
  isExportMode?: boolean;
  itemsPerRow?: number;
}

export const PowerStateCard: React.FC<PowerStateCardProps> = ({
  id,
  title,
  icon,
  emptyTitle,
  slices,
  legend,
  total,
  subTitle,
  isExportMode = false,
  itemsPerRow = 2,
}) => (
  <Card
    className={dashboardCard}
    id={id}
    style={{ overflow: isExportMode ? "visible" : "hidden" }}
  >
    <CardTitle>
      {icon} {title}
    </CardTitle>
    <CardBody>
      {total === 0 ? (
        <CardEmptyState title={emptyTitle} />
      ) : (
        <MigrationDonutChart
          legendVariant="chart"
          data={slices}
          legend={legend}
          height={300}
          width={420}
          donutThickness={18}
          padAngle={1}
          title={`${total}`}
          subTitle={subTitle}
          subTitleColor="var(--pf-t--global--text--color--subtle)"
          titleFontSize={34}
          labelFontSize={16}
          itemsPerRow={itemsPerRow}
          marginLeft="0%"
          tooltipLabelFormatter={({ datum, percent }) =>
            `${datum.countDisplay}\n${percent.toFixed(1)}%`
          }
        />
      )}
    </CardBody>
  </Card>
);

PowerStateCard.displayName = "PowerStateCard";
