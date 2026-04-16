import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IGroupsStore } from "../../../../data/stores/interfaces/IGroupsStore";

export interface GroupDetailsViewModel {
  id?: string;
  group?: Group;
  isLoading: boolean;
  error?: Error;
}

export const useGroupDetailsViewModel = (): GroupDetailsViewModel => {
  const { id } = useParams<{ id: string }>();

  const groupStore = useInjection<IGroupsStore>(Symbols.GroupsStore);

  // Fetch group by ID
  const [fetchState, doFetchGroup] = useAsyncFn(
    async (groupId: string) => {
      const group = await groupStore.get(groupId);
      return group;
    },
    [groupStore],
    { loading: true },
  );

  // Initial fetch
  useEffect(() => {
    if (id) {
      void doFetchGroup(id);
    }
  }, [id, doFetchGroup]);

  return {
    id,
    group: fetchState.value,
    isLoading: fetchState.loading,
    error: fetchState.error,
  };
};
