import type { Infra } from "@openshift-migration-advisor/planner-sdk";
import { RhUiServerIcon } from "@patternfly/react-icons";
import React, { useMemo } from "react";

import { buildHostPowerStateChart } from "../../helpers/powerStates";
import { PowerStateCard } from "./PowerStateCard";

interface HostPowerStatesProps {
  infra: Infra;
  isExportMode?: boolean;
}

export const HostPowerStates: React.FC<HostPowerStatesProps> = ({
  infra,
  isExportMode = false,
}) => {
  const chart = useMemo(
    () => buildHostPowerStateChart(infra.hostPowerStates),
    [infra.hostPowerStates],
  );

  return (
    <PowerStateCard
      id="esxi-host-power-states"
      title="ESXi host power states"
      icon={<RhUiServerIcon />}
      emptyTitle="Host power state data not collected"
      slices={chart.slices}
      legend={chart.legend}
      total={chart.total}
      subTitle="Hosts"
      isExportMode={isExportMode}
      itemsPerRow={2}
    />
  );
};

HostPowerStates.displayName = "HostPowerStates";
