import type { Member } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IGroupsStore } from "../../../../data/stores/interfaces/IGroupsStore";

export interface GroupUsersViewModel {
  id?: string;
  members?: Member[];
  isLoading: boolean;
  error?: Error;
}

export const useGroupMembersViewModel = (): GroupUsersViewModel => {
  const { id } = useParams<{ id: string }>();

  const groupsStore = useInjection<IGroupsStore>(Symbols.GroupsStore);

  // Fetch group by ID
  const [fetchState, doFetchGroupUsers] = useAsyncFn(
    async (groupId: string) => {
      const members = await groupsStore.getMembers(groupId);
      return members;
    },
    [groupsStore],
  );

  // Initial fetch
  useEffect(() => {
    if (id) {
      void doFetchGroupUsers(id);
    }
  }, [id, doFetchGroupUsers]);

  return {
    id,
    members: fetchState.value,
    isLoading: fetchState.loading,
    error: fetchState.error,
  };
};
