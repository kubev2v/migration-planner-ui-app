import type {
  AccountApiInterface,
  Group,
  GroupCreate,
  GroupUpdate,
  Member,
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

  async createGroup(data: GroupCreate): Promise<Group> {
    const newGroup = await this.api.createGroup({ groupCreate: data });
    this.groups = [...this.groups, newGroup];
    this.notify();
    return newGroup;
  }

  async getGroup(id: string): Promise<Group> {
    return this.api.getGroup({ id });
  }

  async updateGroup(id: string, data: GroupUpdate): Promise<Group> {
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

  async deleteGroup(id: string): Promise<void> {
    await this.api.deleteGroup({ id });
    this.groups = this.groups.filter((group) => group.id !== id);
    this.notify();
  }

  async getMembers(groupId: string): Promise<Member[]> {
    return this.api.listGroupMembers({ id: groupId });
  }

  override getSnapshot(): Group[] {
    return this.groups;
  }
}
