import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IOrganizationsStore } from "../../../../data/stores/interfaces/IOrganizationsStore";
import type { Organization } from "../../../../models/OrganizationModel";

export interface OrganizationsViewModel {
  organizations: Organization[];
  partners: Organization[];
  isLoading: boolean;
  error?: Error;
}

export const useOrganizationsViewModel = (): OrganizationsViewModel => {
  const organizationsStore = useInjection<IOrganizationsStore>(
    Symbols.OrganizationsStore,
  );
  const organizations = useSyncExternalStore<Organization[]>(
    organizationsStore.subscribe.bind(organizationsStore),
    organizationsStore.getSnapshot.bind(organizationsStore),
  );

  // Load organizations on mount
  const { loading, error } = useAsync(() => organizationsStore.list(), []);

  return {
    organizations,
    partners: organizations.filter((p) => p.kind === "partner"),
    isLoading: loading,
    error,
  };
};
