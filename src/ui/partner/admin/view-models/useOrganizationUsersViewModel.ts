import { useInjection } from "@y0n1/react-ioc";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IOrganizationsStore } from "../../../../data/stores/interfaces/IOrganizationsStore";
import type { User } from "../../../../models/UserModel";

export interface OrganizationUsersViewModel {
  id?: string;
  users?: User[];
  isLoading: boolean;
  error?: Error;
}

export const useOrganizationUsersViewModel = (): OrganizationUsersViewModel => {
  const { id } = useParams<{ id: string }>();

  const organizationsStore = useInjection<IOrganizationsStore>(
    Symbols.OrganizationsStore,
  );

  // Fetch organization by ID
  const [fetchState, doFetchOrganizationUsers] = useAsyncFn(
    async (organizationId: string) => {
      const users = await organizationsStore.getUsers(organizationId);
      return users;
    },
    [organizationsStore],
  );

  // Initial fetch
  useEffect(() => {
    if (id) {
      void doFetchOrganizationUsers(id);
    }
  }, [id, doFetchOrganizationUsers]);

  return {
    id,
    users: fetchState.value,
    isLoading: fetchState.loading,
    error: fetchState.error,
  };
};
