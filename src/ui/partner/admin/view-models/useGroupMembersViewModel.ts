import type {
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";
import { useInjection } from "@y0n1/react-ioc";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { Symbols } from "../../../../config/Dependencies";
import type { IGroupMembersStore } from "../../../../data/stores/interfaces/IGroupMembersStore";

export interface GroupMembersViewModel {
  id?: string;
  members?: Member[];
  isLoading: boolean;
  error?: Error;
  addMember: (groupId: string, data: MemberCreate) => Promise<Member>;
  deleteMember: (groupId: string, username: string) => Promise<void>;
}

export const useGroupMembersViewModel = (): GroupMembersViewModel => {
  const { id } = useParams<{ id: string }>();

  const groupMembersStore = useInjection<IGroupMembersStore>(
    Symbols.GroupMembersStore,
  );

  const snapshot = useSyncExternalStore(
    groupMembersStore.subscribe.bind(groupMembersStore),
    groupMembersStore.getSnapshot.bind(groupMembersStore),
  );

  const members = useMemo(() => {
    return snapshot.groupId === id ? snapshot.members : [];
  }, [snapshot, id]);

  // Fetch group by ID
  const [fetchState, doFetchGroupMembers] = useAsyncFn(
    async (groupId: string) => {
      return await groupMembersStore.list(groupId);
    },
    [groupMembersStore],
    { loading: true },
  );

  const [addState, doAddMember] = useAsyncFn(
    async (groupId: string, data: MemberCreate): Promise<Member> => {
      return await groupMembersStore.create(groupId, data);
    },
    [groupMembersStore],
  );

  const [deleteState, doDeleteMember] = useAsyncFn(
    async (groupId: string, username: string): Promise<void> => {
      await groupMembersStore.delete(groupId, username);
    },
    [groupMembersStore],
  );

  // Initial fetch
  useEffect(() => {
    if (id) {
      void doFetchGroupMembers(id);
    }
  }, [id, doFetchGroupMembers]);

  return {
    id,
    members,
    isLoading: fetchState.loading || addState.loading || deleteState.loading,
    error: fetchState.error || addState.error || deleteState.error,
    addMember: doAddMember,
    deleteMember: doDeleteMember,
  };
};
