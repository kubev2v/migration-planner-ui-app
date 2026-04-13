import { Label } from "@patternfly/react-core";
import React from "react";

import type { PartnerRequest } from "../../../../models/PartnerRequestModel";

interface RequestStatusProps {
  status: PartnerRequest["status"];
}

export const RequestStatus: React.FC<RequestStatusProps> = ({ status }) => {
  switch (status) {
    case "pending":
      return <Label color="yellow">Waiting for approval</Label>;
    case "rejected":
      return <Label color="red">Rejected</Label>;
    default:
      return <Label>{status}</Label>;
  }
};

RequestStatus.displayName = "RequestStatus";
