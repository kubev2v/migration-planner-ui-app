import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useEffect, useSyncExternalStore } from "react";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IAccountStore } from "../../../../data/stores/interfaces/IAccountStore";
import type { IGroupsStore } from "../../../../data/stores/interfaces/IGroupsStore";

export interface MyPartnerViewModel {
  partnerGroup?: Group;
  isLoading: boolean;
  error?: Error;
}

export const useMyPartnerViewModel = (): MyPartnerViewModel => {
  const accountStore = useInjection<IAccountStore>(Symbols.AccountStore);
  const identity = useSyncExternalStore(
    accountStore.subscribe.bind(accountStore),
    accountStore.getSnapshot.bind(accountStore),
  );

  const groupsStore = useInjection<IGroupsStore>(Symbols.GroupsStore);

  useSyncExternalStore<Group[]>(
    groupsStore.subscribe.bind(groupsStore),
    groupsStore.getSnapshot.bind(groupsStore),
  );

  // Fetch group by identity's partnerId
  const [fetchState, doFetchGroup] = useAsyncFn(
    async (partnerId: string) => {
      const group = await groupsStore.get(partnerId);
      return group;
    },
    [groupsStore],
  );

  // Load partner group when identity is available
  useEffect(() => {
    if (identity?.partnerId) {
      void doFetchGroup(identity.partnerId);
    }
  }, [identity?.partnerId, doFetchGroup]);

  return {
    partnerGroup: fetchState.value,
    isLoading: fetchState.loading,
    error: fetchState.error,
  };
};
