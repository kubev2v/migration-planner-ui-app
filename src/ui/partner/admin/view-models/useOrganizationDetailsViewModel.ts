import { useInjection } from "@y0n1/react-ioc";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IOrganizationsStore } from "../../../../data/stores/interfaces/IOrganizationsStore";
import type { Organization } from "../../../../models/OrganizationModel";

export interface OrganizationDetailsViewModel {
  id?: string;
  organization?: Organization;
  isLoading: boolean;
  error?: Error;
}

export const useOrganizationDetailsViewModel =
  (): OrganizationDetailsViewModel => {
    const { id } = useParams<{ id: string }>();

    const organizationsStore = useInjection<IOrganizationsStore>(
      Symbols.OrganizationsStore,
    );

    // Fetch organization by ID
    const [fetchState, doFetchOrganization] = useAsyncFn(
      async (organizationId: string) => {
        const organization = await organizationsStore.get(organizationId);
        return organization;
      },
      [organizationsStore],
    );

    // Initial fetch
    useEffect(() => {
      if (id) {
        void doFetchOrganization(id);
      }
    }, [id, doFetchOrganization]);

    return {
      id,
      organization: fetchState.value,
      isLoading: fetchState.loading,
      error: fetchState.error,
    };
  };
