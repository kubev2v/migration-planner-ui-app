import React from "react";

import { routes } from "../../../../routing/Routes";
import { AssessmentMethodCard } from "./AssessmentMethodCard";

const illustrationSrc = new URL(
  "../../assets/discovery-appliance-illustration.svg",
  import.meta.url,
).href;

const DISCOVERY_OVA_LEARN_MORE_URL =
  "https://kubev2v.github.io/openshift-migration-advisor-docs/docs/tutorial/#discovery-agent-flow";

type DiscoveryApplianceCardProps = {
  onSelect: () => void;
};

export const DiscoveryApplianceCard: React.FC<DiscoveryApplianceCardProps> = ({
  onSelect,
}) => (
  <AssessmentMethodCard
    id="discovery-ova-option"
    title="Discovery appliance (OVA)"
    tagline="Deploy an appliance for a deep scan of your vCenter. Capture live utilization, configuration details, migration blockers, and VM dependencies."
    onSelect={onSelect}
    illustrationSrc={illustrationSrc}
    learnMoreHref={DISCOVERY_OVA_LEARN_MORE_URL}
    isRecommended
    details={[
      { label: "Time to first assessment", value: "~10 mins (spin up VM)" },
      { label: "Data sharing", value: "Optional, but recommended" },
      {
        label: "Depth of analysis",
        value: "Deep (per-VM analysis, and advanced tooling)",
      },
      {
        label: "Storage calculation",
        value: "Based on real utilization metrics",
      },
      {
        label: "Dependency mapping",
        value: "Mapped (network and VM dependencies)",
      },
    ]}
    sampleLink={{
      to: routes.discoveryOvaExampleReport,
      label: "See OVA report",
    }}
  />
);

DiscoveryApplianceCard.displayName = "DiscoveryApplianceCard";
