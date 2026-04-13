import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import { type Identity } from "../../models/IdentityModel";
import { getFakeIdentity } from "../stubs/stubIdentity";
import type { IIdentityStore } from "./interfaces/IIdentityStore";

export class IdentityStore
  extends ExternalStoreBase<Identity | null>
  implements IIdentityStore
{
  private identity: Identity | null = null;

  // eslint-disable-next-line @typescript-eslint/require-await
  async getIdentity(): Promise<Identity> {
    this.identity = getFakeIdentity();
    console.log("[IdentityStore] GET /api/identity:", this.identity);
    this.notify();
    return this.identity;
  }

  override getSnapshot(): Identity | null {
    return this.identity;
  }
}
