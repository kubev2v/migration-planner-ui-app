import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@patternfly/react-core";
import React from "react";

import type { Partner } from "../../../../models/PartnerModel";

interface PartnerCardProps {
  partner: Partner;
  onRequestAssignment: (partner: Partner | null) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  onRequestAssignment,
}) => {
  return (
    <Card>
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
  );
};

PartnerCard.displayName = "PartnerCard";
