import type { IdentityKindEnum } from "@openshift-migration-advisor/planner-sdk";
import { Outlet } from "react-router-dom";

import { LoadingSpinner } from "../../core/components/LoadingSpinner";
import { useIdentityViewModel } from "../view-models/useIdentityViewModel";
import { PartnerViewRedirect } from "./PartnerViewRedirect";

export const PartnerViewRequireRole = ({
  role,
}: {
  role: IdentityKindEnum;
}) => {
  const { identity: user } = useIdentityViewModel();

  if (!user) return <LoadingSpinner />;

  if (user.kind !== role) {
    return <PartnerViewRedirect />;
  }

  return <Outlet />;
};

PartnerViewRequireRole.displayName = "PartnerViewRequireRole";
