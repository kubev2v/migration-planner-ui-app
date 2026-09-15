import {
  type AccountApiInterface,
  type Identity,
  IdentityKindEnum,
} from "@openshift-migration-advisor/planner-sdk";

import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { IAccountStore, IdentityView } from "./interfaces/IAccountStore";

const toIdentityView = (identity: Identity): IdentityView => ({
  ...identity,
  isPartner: identity.kind === IdentityKindEnum.Partner,
});

export class AccountStore
  extends ExternalStoreBase<IdentityView | null>
  implements IAccountStore
{
  private identity: IdentityView | null = null;
  private api: AccountApiInterface;

  constructor(api: AccountApiInterface) {
    super();
    this.api = api;
  }

  async getIdentity(): Promise<IdentityView> {
    this.identity = toIdentityView(await this.api.getIdentity());
    this.notify();
    return this.identity;
  }

  override getSnapshot(): IdentityView | null {
    return this.identity;
  }
}
