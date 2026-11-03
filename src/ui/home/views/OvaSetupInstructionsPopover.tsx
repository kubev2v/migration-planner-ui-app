import { Button, Popover } from "@patternfly/react-core";
import React from "react";

import { themePopoverFlyoutProps } from "../../../lib/patternfly/flyoutAppendTo";
import { VCenterSetupInstructions } from "../../core/components/VCenterSetupInstructions";

export const OvaSetupInstructionsPopover: React.FC = () => (
  <Popover
    {...themePopoverFlyoutProps}
    aria-label="OVA installation instructions"
    headerContent="OVA set up instructions"
    headerComponent="h6"
    bodyContent={<VCenterSetupInstructions />}
    minWidth="600px"
  >
    <Button variant="link" isInline>
      View OVA setup instructions
    </Button>
  </Popover>
);

OvaSetupInstructionsPopover.displayName = "OvaSetupInstructionsPopover";

export default OvaSetupInstructionsPopover;
