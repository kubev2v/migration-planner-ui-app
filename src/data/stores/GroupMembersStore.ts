import type {
  AccountApiInterface,
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";

import { parseApiError } from "../../lib/common/ErrorParser";
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
  private snapshot: GroupMembersSnapshot = {
    groupId: null,
    members: [],
  };

  constructor(api: AccountApiInterface) {
    super();
    this.api = api;
  }

  async list(groupId: string): Promise<Member[]> {
    try {
      this.members = await this.api.listGroupMembers({ id: groupId });
      this.currentGroupId = groupId;
      this.snapshot = {
        groupId: this.currentGroupId,
        members: this.members,
      };
      this.notify();
      return this.members;
    } catch (err) {
      throw await parseApiError(err, "Failed to load group members");
    }
  }

  async create(groupId: string, data: MemberCreate): Promise<Member> {
    try {
      const newMember = await this.api.createGroupMember({
        id: groupId,
        memberCreate: data,
      });
      if (this.currentGroupId === groupId) {
        this.members = [...this.members, newMember];
        this.snapshot = {
          groupId: this.currentGroupId,
          members: this.members,
        };
        this.notify();
      }
      return newMember;
    } catch (err) {
      throw await parseApiError(err, "Failed to create group member");
    }
  }

  async delete(groupId: string, username: string): Promise<void> {
    try {
      await this.api.removeGroupMember({
        id: groupId,
        username: username,
      });
      if (this.currentGroupId === groupId) {
        this.members = this.members.filter(
          (member) => member.username !== username,
        );
        this.snapshot = {
          groupId: this.currentGroupId,
          members: this.members,
        };
        this.notify();
      }
    } catch (err) {
      throw await parseApiError(err, "Failed to delete group member");
    }
  }

  override getSnapshot(): GroupMembersSnapshot {
    return this.snapshot;
  }
}
