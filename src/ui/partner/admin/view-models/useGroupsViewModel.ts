import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useSyncExternalStore } from "react";
import { useAsync } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IGroupsStore } from "../../../../data/stores/interfaces/IGroupsStore";

export interface GroupsViewModel {
  groups: Group[];
  partners: Group[];
  isLoading: boolean;
  error?: Error;
}

export const useGroupsViewModel = (): GroupsViewModel => {
  const groupsStore = useInjection<IGroupsStore>(Symbols.GroupsStore);
  const groups = useSyncExternalStore<Group[]>(
    groupsStore.subscribe.bind(groupsStore),
    groupsStore.getSnapshot.bind(groupsStore),
  );

  // Load groups on mount
  const { loading, error } = useAsync(() => groupsStore.list(), []);

  return {
    groups,
    partners: groups.filter((p) => p.kind === "partner"),
    isLoading: loading,
    error,
  };
};
