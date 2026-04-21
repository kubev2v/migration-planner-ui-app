import type {
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface GroupMembersSnapshot {
  groupId: string | null;
  members: Member[];
}

export interface IGroupMembersStore extends ExternalStore<GroupMembersSnapshot> {
  list(groupId: string): Promise<Member[]>;
  create(groupId: string, data: MemberCreate): Promise<Member>;
  delete(groupId: string, username: string): Promise<void>;
}
