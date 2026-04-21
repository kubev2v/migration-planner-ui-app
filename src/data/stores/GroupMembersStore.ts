import type {
  AccountApiInterface,
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type {
  GroupMembersSnapshot,
  IGroupMembersStore,
} from "./interfaces/IGroupMembersStore";

export class GroupMembersStore
  extends ExternalStoreBase<GroupMembersSnapshot>
  implements IGroupMembersStore
{
  private members: Member[] = [];
  private api: AccountApiInterface;
  private currentGroupId: string | null = null;

  constructor(api: AccountApiInterface) {
    super();
    this.api = api;
  }

  async list(groupId: string): Promise<Member[]> {
    this.members = await this.api.listGroupMembers({ id: groupId });
    this.currentGroupId = groupId;
    this.notify();
    return this.members;
  }

  async create(groupId: string, data: MemberCreate): Promise<Member> {
    const newMember = await this.api.createGroupMember({
      id: groupId,
      memberCreate: data,
    });
    if (this.currentGroupId === groupId) {
      this.members = [...this.members, newMember];
      this.notify();
    }
    return newMember;
  }

  async delete(groupId: string, username: string): Promise<void> {
    await this.api.removeGroupMember({
      id: groupId,
      username: username,
    });
    if (this.currentGroupId === groupId) {
      this.members = this.members.filter(
        (member) => member.username !== username,
      );
      this.notify();
    }
  }

  override getSnapshot(): GroupMembersSnapshot {
    return {
      groupId: this.currentGroupId,
      members: this.members,
    };
  }
}
