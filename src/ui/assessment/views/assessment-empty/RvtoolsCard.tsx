import React from "react";

import { routes } from "../../../../routing/Routes";
import { AssessmentMethodCard } from "./AssessmentMethodCard";

const illustrationSrc = new URL(
  "../../assets/rvtools-illustration.svg",
  import.meta.url,
).href;

const RVTOOLS_LEARN_MORE_URL =
  "https://kubev2v.github.io/openshift-migration-advisor-docs/docs/tutorial/#prerequisites-rvtools-file-requirements";

type RvtoolsCardProps = {
  onSelect: () => void;
};

export const RvtoolsCard: React.FC<RvtoolsCardProps> = ({ onSelect }) => (
  <AssessmentMethodCard
    id="rvtools-option"
    title="RVTools"
    tagline="Upload an existing RVTools spreadsheet for a static inventory snapshot."
    onSelect={onSelect}
    illustrationSrc={illustrationSrc}
    learnMoreHref={RVTOOLS_LEARN_MORE_URL}
    details={[
      { label: "Time to first assessment", value: "< 5 mins (upload file)" },
      { label: "Data sharing", value: "Required" },
      {
        label: "Depth of analysis",
        value: "High-level (aggregated data, manual blocker review)",
      },
      {
        label: "Storage calculation",
        value: "Based on estimated metrics",
      },
      { label: "Dependency mapping", value: "Not captured" },
    ]}
    sampleLink={{ to: routes.exampleReport, label: "See RVTools report" }}
  />
);

RvtoolsCard.displayName = "RvtoolsCard";
