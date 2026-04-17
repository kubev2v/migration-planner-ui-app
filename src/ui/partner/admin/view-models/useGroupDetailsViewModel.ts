import type {
  Group,
  GroupUpdate,
} from "@openshift-migration-advisor/planner-sdk";
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
  updateGroup: (data: GroupUpdate) => Promise<void>;
}

export const useGroupDetailsViewModel = (): GroupDetailsViewModel => {
  const { id } = useParams<{ id: string }>();

  const groupStore = useInjection<IGroupsStore>(Symbols.GroupsStore);

  // Fetch group by ID
  const [fetchState, doFetchGroup] = useAsyncFn(
    async (groupId: string) => {
      const group = await groupStore.getGroup(groupId);
      return group;
    },
    [groupStore],
    { loading: true },
  );

  // Update group
  const [updateState, doUpdateGroup] = useAsyncFn(
    async (data: GroupUpdate) => {
      if (!id) {
        throw new Error("Group ID is required");
      }
      await groupStore.updateGroup(id, data);
      await doFetchGroup(id);
    },
    [groupStore, id, doFetchGroup],
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
    isLoading: fetchState.loading || updateState.loading,
    error: fetchState.error || updateState.error,
    updateGroup: doUpdateGroup,
  };
};
