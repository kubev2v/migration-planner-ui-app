import { useInjection } from "@y0n1/react-ioc";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Symbols } from "../config/Dependencies";
import type { IIdentityStore } from "../data/stores/interfaces/IIdentityStore";

export const IdentityWrapper: React.FC = () => {
  const identityStore = useInjection<IIdentityStore>(Symbols.IdentityStore);

  useEffect(() => {
    // Load identity on mount
    identityStore.getIdentity().catch((error) => {
      console.error("Failed to load identity:", error);
    });
  }, [identityStore]);

  return <Outlet />;
};
IdentityWrapper.displayName = "IdentityWrapper";
