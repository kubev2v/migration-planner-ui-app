import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import { type Organization } from "../../models/OrganizationModel";
import type { User } from "../../models/UserModel";
import { getFakeOrganizations } from "../stubs/stubOrganizations";
import type { IOrganizationsStore } from "./interfaces/IOrganizationsStore";

export class OrganizationsStore
  extends ExternalStoreBase<Organization[]>
  implements IOrganizationsStore
{
  private organizations: Organization[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async list(): Promise<Organization[]> {
    this.organizations = getFakeOrganizations();
    console.log(
      "[OrganizationsStore] GET /api/organizations",
      this.organizations,
    );
    this.notify();
    return this.organizations;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(organizationId: string): Promise<Organization | undefined> {
    const organization = getFakeOrganizations().find(
      (organization) => organization.id === organizationId,
    );
    console.log(
      `[OrganizationsStore] GET /api/organizations/${organizationId}`,
      organization,
    );
    return organization;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUsers(organizationId: string): Promise<User[]> {
    console.log(
      `[OrganizationsStore] GET /api/organizations/${organizationId}/users`,
      [],
    );
    return [];
  }

  override getSnapshot(): Organization[] {
    return this.organizations;
  }
}
