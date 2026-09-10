import { css } from "@emotion/css";
import { Label } from "@patternfly/react-core";
import {
  RhUiCheckCircleIcon,
  RhUiCloseCircleIcon,
} from "@patternfly/react-icons";
import React from "react";

import type { FeatureStatus } from "../../helpers/infrastructureSummary";

const enabledLabel = css`
  --pf-v6-c-label--m-green__content--Color: var(
    --pf-t--global--color--status--success--default
  );
`;

interface FeatureStatusBadgeProps {
  status: FeatureStatus;
}

export const FeatureStatusBadge: React.FC<FeatureStatusBadgeProps> = ({
  status,
}) => {
  if (status === "unknown") {
    return <span>—</span>;
  }

  if (status === "enabled") {
    return (
      <Label
        color="green"
        isCompact
        icon={<RhUiCheckCircleIcon />}
        className={enabledLabel}
      >
        Enabled
      </Label>
    );
  }

  return (
    <Label color="grey" isCompact icon={<RhUiCloseCircleIcon />}>
      Disabled
    </Label>
  );
};

FeatureStatusBadge.displayName = "FeatureStatusBadge";
