import type { Group, Member } from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IGroupsStore extends ExternalStore<Group[]> {
  list(): Promise<Group[]>;
  get(groupId: string): Promise<Group | undefined>;
  getMembers(groupId: string): Promise<Member[]>;
}
