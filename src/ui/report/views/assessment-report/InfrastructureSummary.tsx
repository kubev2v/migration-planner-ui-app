import { Card, CardBody, CardTitle } from "@patternfly/react-core";
import React from "react";

import type { InfrastructureSummaryModel } from "../../helpers/infrastructureSummary";
import {
  summaryCard,
  summaryStat,
  summaryStatLabel,
  summaryStatsRow,
  summaryStatValue,
} from "./styles";

interface InfrastructureSummaryProps {
  summary: InfrastructureSummaryModel;
}

const formatCount = (value: number | undefined): string =>
  typeof value === "number" ? String(value) : "—";

export const InfrastructureSummary: React.FC<InfrastructureSummaryProps> = ({
  summary,
}) => (
  <Card className={summaryCard} id="infrastructure-summary">
    <CardTitle>Infrastructure summary</CardTitle>
    <CardBody>
      <div className={summaryStatsRow}>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>VMware version</span>
          <span className={summaryStatValue}>{summary.vmwareVersion}</span>
        </div>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>Datacenters</span>
          <span className={summaryStatValue}>
            {formatCount(summary.datacenters)}
          </span>
        </div>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>vCenters</span>
          <span className={summaryStatValue}>
            {formatCount(summary.vCenters)}
          </span>
        </div>
        <div className={summaryStat}>
          <span className={summaryStatLabel}>ESXi hosts</span>
          <span className={summaryStatValue}>
            {formatCount(summary.esxiHosts)}
          </span>
        </div>
      </div>
    </CardBody>
  </Card>
);

InfrastructureSummary.displayName = "InfrastructureSummary";
