import type {
  AccountApiInterface,
  Group,
  GroupCreate,
  GroupUpdate,
} from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { IGroupsStore } from "./interfaces/IGroupsStore";

export class GroupsStore
  extends ExternalStoreBase<Group[]>
  implements IGroupsStore
{
  private groups: Group[] = [];
  private api: AccountApiInterface;

  constructor(api: AccountApiInterface) {
    super();
    this.api = api;
  }

  async list(): Promise<Group[]> {
    this.groups = await this.api.listGroups({});
    this.notify();
    return this.groups;
  }

  async create(data: GroupCreate): Promise<Group> {
    const newGroup = await this.api.createGroup({ groupCreate: data });
    this.groups = [...this.groups, newGroup];
    this.notify();
    return newGroup;
  }

  async get(id: string): Promise<Group> {
    return this.api.getGroup({ id });
  }

  async update(id: string, data: GroupUpdate): Promise<Group> {
    const updatedGroup = await this.api.updateGroup({
      id,
      groupUpdate: data,
    });
    this.groups = this.groups.map((group) =>
      group.id === id ? updatedGroup : group,
    );
    this.notify();
    return updatedGroup;
  }

  async delete(id: string): Promise<void> {
    await this.api.deleteGroup({ id });
    this.groups = this.groups.filter((group) => group.id !== id);
    this.notify();
  }

  override getSnapshot(): Group[] {
    return this.groups;
  }
}
