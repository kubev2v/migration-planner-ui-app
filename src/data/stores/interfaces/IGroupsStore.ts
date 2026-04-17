import type {
  Group,
  GroupCreate,
  GroupUpdate,
  Member,
} from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IGroupsStore extends ExternalStore<Group[]> {
  list(): Promise<Group[]>;
  createGroup(data: GroupCreate): Promise<Group>;
  getGroup(id: string): Promise<Group>;
  updateGroup(id: string, data: GroupUpdate): Promise<Group>;
  deleteGroup(id: string): Promise<void>;
  getMembers(groupId: string): Promise<Member[]>;
}
