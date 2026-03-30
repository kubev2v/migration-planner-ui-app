import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";
import type { Organization } from "../../../models/OrganizationModel";
import type { User } from "../../../models/UserModel";

export interface IOrganizationsStore extends ExternalStore<Organization[]> {
  list(): Promise<Organization[]>;
  get(organizationId: string): Promise<Organization | undefined>;
  getUsers(organizationId: string): Promise<User[]>;
}
