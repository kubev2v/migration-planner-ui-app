import type { Agent } from "@openshift-migration-advisor/planner-sdk";
import { Split, SplitItem } from "@patternfly/react-core";
import React from "react";

import { AgentStatusView } from "../../../environment/views/AgentStatusView";

export const RVTOOLS_FILE_UPLOAD_SOURCE = "Source: RVTools file upload";

export interface ReportSourceStatusProps {
  sourceType?: string;
  displayStatus?: Agent["status"];
  isReady?: boolean;
  agent?: Agent;
  onPremises?: boolean;
  hasInventory?: boolean;
  updatedAt?: string | Date;
}

/**
 * Source / appliance status line shared by live reports and example reports.
 */
export const ReportSourceStatus: React.FC<ReportSourceStatusProps> = ({
  sourceType,
  displayStatus,
  isReady,
  agent,
  onPremises,
  hasInventory,
  updatedAt,
}) => {
  if (sourceType === "rvtools") {
    return <>{RVTOOLS_FILE_UPLOAD_SOURCE}</>;
  }

  return (
    <Split hasGutter>
      <SplitItem isFilled={false}>Discovery appliance status:</SplitItem>
      <SplitItem isFilled={false}>
        <AgentStatusView
          status={displayStatus ?? "not-connected"}
          statusInfo={
            isReady ? undefined : (agent?.statusInfo ?? "Not connected")
          }
          credentialUrl={agent?.credentialUrl ?? ""}
          uploadedManually={Boolean(onPremises) && hasInventory}
          updatedAt={updatedAt}
          disableInteractions
        />
      </SplitItem>
    </Split>
  );
};

ReportSourceStatus.displayName = "ReportSourceStatus";
