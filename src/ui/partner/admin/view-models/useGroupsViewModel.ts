import type {
  Group,
  GroupCreate,
} from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync, useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IGroupsStore } from "../../../../data/stores/interfaces/IGroupsStore";

export interface GroupsViewModel {
  groups: Group[];
  partners: Group[];
  isLoading: boolean;
  error?: Error;
  createGroup: (data: GroupCreate) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
}

export const useGroupsViewModel = (): GroupsViewModel => {
  const groupsStore = useInjection<IGroupsStore>(Symbols.GroupsStore);
  const groups = useSyncExternalStore<Group[]>(
    groupsStore.subscribe.bind(groupsStore),
    groupsStore.getSnapshot.bind(groupsStore),
  );

  // Load groups on mount
  const { loading, error } = useAsync(() => groupsStore.list(), []);

  // Create group
  const [createState, doCreateGroup] = useAsyncFn(
    async (data: GroupCreate): Promise<Group> => {
      return await groupsStore.createGroup(data);
    },
    [groupsStore],
  );

  // Delete group
  const [deleteState, doDeleteGroup] = useAsyncFn(
    async (groupId: string): Promise<void> => {
      await groupsStore.deleteGroup(groupId);
    },
    [groupsStore],
  );

  return {
    groups,
    partners: groups.filter((p) => p.kind === "partner"),
    isLoading: loading || createState.loading || deleteState.loading,
    error: error || createState.error || deleteState.error,
    createGroup: doCreateGroup,
    deleteGroup: doDeleteGroup,
  };
};
