import { Navigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";
import { LoadingSpinner } from "../../core/components/LoadingSpinner";
import { useIdentityViewModel } from "../view-models/useIdentityViewModel";

export const PartnerViewRedirect = () => {
  const { identity: user } = useIdentityViewModel();

  if (!user) return <LoadingSpinner />;

  switch (user.kind) {
    case "regular":
      return <Navigate to={routes.partners} replace />;
    case "customer":
      return <Navigate to={routes.myPartner} replace />;
    case "partner":
      return <Navigate to={routes.customers} replace />;
    case "admin":
      return <Navigate to={routes.adminGroups} replace />;
    default:
      return <Navigate to={routes.partners} replace />;
  }
};

PartnerViewRedirect.displayName = "PartnerViewRedirect";
