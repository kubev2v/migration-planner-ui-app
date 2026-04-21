import type {
  Group,
  GroupCreate,
  GroupUpdate,
} from "@openshift-migration-advisor/planner-sdk";

import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

export interface IGroupsStore extends ExternalStore<Group[]> {
  list(): Promise<Group[]>;
  create(data: GroupCreate): Promise<Group>;
  get(id: string): Promise<Group>;
  update(id: string, data: GroupUpdate): Promise<Group>;
  delete(id: string): Promise<void>;
}
