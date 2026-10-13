import { Gallery } from "@patternfly/react-core";
import React from "react";

import type { Partner } from "../../../../models/PartnerModel";
import { PartnerCard } from "./PartnerCard";

interface PartnersGalleryProps {
  partners: Partner[];
  onRequestAssignment: (partner: Partner | null) => void;
}

export const PartnersGallery: React.FC<PartnersGalleryProps> = ({
  partners,
  onRequestAssignment,
}) => {
  return (
    <Gallery
      hasGutter
      minWidths={{
        default: "100%",
        lg: "calc(50% - 1em)",
        xl: "calc(33% - 1em)",
        "2xl": "calc(20% - 1em)",
      }}
      maxWidths={{ default: "100%", md: "1fr" }}
    >
      {partners.map((partner) => (
        <PartnerCard
          key={partner.id}
          partner={partner}
          onRequestAssignment={onRequestAssignment}
        />
      ))}
    </Gallery>
  );
};

PartnersGallery.displayName = "PartnersGallery";
