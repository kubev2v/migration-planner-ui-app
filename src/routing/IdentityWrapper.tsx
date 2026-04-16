import { useInjection } from "@y0n1/react-ioc";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Symbols } from "../config/Dependencies";
import type { IAccountStore } from "../data/stores/interfaces/IAccountStore";

export const IdentityWrapper: React.FC = () => {
  const accountStore = useInjection<IAccountStore>(Symbols.AccountStore);

  useEffect(() => {
    // Load identity on mount
    accountStore.getIdentity().catch((error) => {
      console.error("Failed to load identity:", error);
    });
  }, [accountStore]);

  return <Outlet />;
};
IdentityWrapper.displayName = "IdentityWrapper";
