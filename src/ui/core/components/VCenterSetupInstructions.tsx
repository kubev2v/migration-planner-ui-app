import { Stack, StackItem } from "@patternfly/react-core";
import React from "react";

import { InstructionsList } from "./InstructionsList";

export const VCenterSetupInstructions: React.FC = () => {
  return (
    <Stack hasGutter>
      <StackItem>
        <strong>Deploy the discovery appliance in vCenter</strong>
        <InstructionsList
          items={[
            { text: <span>Download the OVA or copy its URL.</span> },
            {
              text: (
                <span>
                  In vCenter, right-click the target cluster and select "Deploy
                  OVF Template..." to deploy the OVA.
                </span>
              ),
            },
            {
              text: (
                <span>
                  Paste the URL or upload the OVA, then finish the deployment.
                </span>
              ),
            },
            {
              text: (
                <span>
                  Power on the VM and note its assigned IP address in vCenter.
                </span>
              ),
            },
          ]}
        />
      </StackItem>
      <StackItem>
        <strong>Connect the appliance to vCenter</strong>
        <InstructionsList
          start={5}
          items={[
            {
              text: (
                <span>
                  Open your discovery appliance using the IP address, then
                  connect to your VMware environment.
                </span>
              ),
            },
            {
              text: (
                <span>
                  Enter your vCenter credentials, then choose whether to share
                  aggregated data with Red Hat. Credentials remain only in the
                  appliance's temporary memory, sharing lets you monitor VM
                  status in the Migration Advisor console.{" "}
                  <a
                    href="https://kubev2v.github.io/openshift-migration-advisor-docs/docs/aggregated-data-report/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn about shared data
                  </a>
                  .
                </span>
              ),
            },
          ]}
        />
      </StackItem>
    </Stack>
  );
};

VCenterSetupInstructions.displayName = "VCenterSetupInstructions";
