import { Button, Popover } from "@patternfly/react-core";
import React from "react";

import { themePopoverFlyoutProps } from "../../../lib/patternfly/flyoutAppendTo";
import { OVASetUpInstructions } from "../../core/components/OVASetUpInstructions";

export const OvaSetupInstructionsPopover: React.FC = () => (
  <Popover
    {...themePopoverFlyoutProps}
    aria-label="OVA installation instructions"
    headerContent="OVA set up instructions"
    headerComponent="h6"
    bodyContent={<OVASetUpInstructions />}
    minWidth="600px"
  >
    <Button variant="link" isInline>
      View OVA setup instructions
    </Button>
  </Popover>
);

OvaSetupInstructionsPopover.displayName = "OvaSetupInstructionsPopover";

export default OvaSetupInstructionsPopover;
