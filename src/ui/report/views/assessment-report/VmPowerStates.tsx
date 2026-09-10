import type { VMs } from "@openshift-migration-advisor/planner-sdk";
import RhUiVirtualMachineIcon from "@patternfly/react-icons/dist/esm/icons/virtual-machine-icon";
import React, { useMemo } from "react";

import { buildVmPowerStateChart } from "../../helpers/powerStates";
import { PowerStateCard } from "./PowerStateCard";

interface VmPowerStatesProps {
  vms: VMs;
  isExportMode?: boolean;
}

export const VmPowerStates: React.FC<VmPowerStatesProps> = ({
  vms,
  isExportMode = false,
}) => {
  const chart = useMemo(
    () => buildVmPowerStateChart(vms.powerStates),
    [vms.powerStates],
  );

  return (
    <PowerStateCard
      id="vm-power-states"
      title="VM power states"
      icon={<RhUiVirtualMachineIcon />}
      emptyTitle="VM power state data not collected"
      slices={chart.slices}
      legend={chart.legend}
      total={chart.total}
      subTitle="VMs"
      isExportMode={isExportMode}
      itemsPerRow={2}
    />
  );
};

VmPowerStates.displayName = "VmPowerStates";
