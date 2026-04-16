import type {
  AccountApiInterface,
  Group,
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

  async get(groupId: string): Promise<Group | undefined> {
    return this.api.getGroup({ id: groupId });
  }

  async getMembers(groupId: string): Promise<Member[]> {
    return this.api.listGroupMembers({ id: groupId });
  }

  override getSnapshot(): Group[] {
    return this.groups;
  }
}
