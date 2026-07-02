import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Gallery,
} from "@patternfly/react-core";
import React from "react";

import type { Partner } from "../../../../models/PartnerModel";

interface PartnersGalleryProps {
  partners: Partner[];
  onRequestAssignment: (partner: Partner | null) => void;
}

export const PartnersGallery: React.FC<PartnersGalleryProps> = ({
  partners,
  onRequestAssignment,
}) => {
  return (
    <Gallery hasGutter minWidths={{ default: "300px" }}>
      {partners.map((partner) => (
        <Card key={partner.id}>
          <CardHeader>
            <img
              src={partner.icon}
              alt={`${partner.name} icon`}
              style={{
                height: "60px",
              }}
            />
          </CardHeader>
          <CardTitle>{partner.name}</CardTitle>
          <CardBody>{partner.description}</CardBody>
          <CardFooter>
            <Button
              variant="primary"
              isBlock
              onClick={() => onRequestAssignment(partner)}
            >
              Request assignment
            </Button>
          </CardFooter>
        </Card>
      ))}
    </Gallery>
  );
};

PartnersGallery.displayName = "PartnersGallery";
