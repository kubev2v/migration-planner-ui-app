import type {
  AccountApiInterface,
  Identity,
} from "@openshift-migration-advisor/planner-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountStore } from "../AccountStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createMockApi = (): AccountApiInterface =>
  ({
    getIdentity: vi.fn(),
  }) as unknown as AccountApiInterface;

const partnerIdentity: Identity = {
  username: "partner-user",
  kind: "partner",
  groupId: "group-1",
  partnerId: null,
};

const regularIdentity: Identity = {
  username: "regular-user",
  kind: "regular",
  groupId: null,
  partnerId: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AccountStore", () => {
  let api: AccountApiInterface;
  let store: AccountStore;

  beforeEach(() => {
    api = createMockApi();
    store = new AccountStore(api);
  });

  it("initial snapshot is null", () => {
    expect(store.getSnapshot()).toBeNull();
  });

  it("enriches a partner identity with isPartner = true", async () => {
    vi.mocked(api.getIdentity).mockResolvedValue(partnerIdentity);

    const result = await store.getIdentity();

    expect(result.isPartner).toBe(true);
    expect(store.getSnapshot()?.isPartner).toBe(true);
  });

  it("enriches a non-partner identity with isPartner = false", async () => {
    vi.mocked(api.getIdentity).mockResolvedValue(regularIdentity);

    const result = await store.getIdentity();

    expect(result.isPartner).toBe(false);
    expect(store.getSnapshot()?.isPartner).toBe(false);
  });

  it("preserves the original identity fields", async () => {
    vi.mocked(api.getIdentity).mockResolvedValue(partnerIdentity);

    const result = await store.getIdentity();

    expect(result).toMatchObject(partnerIdentity);
  });

  it("keeps the snapshot referentially stable between reads", async () => {
    vi.mocked(api.getIdentity).mockResolvedValue(partnerIdentity);
    await store.getIdentity();

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("notifies subscribers on fetch", async () => {
    const listener = vi.fn();
    store.subscribe(listener);

    vi.mocked(api.getIdentity).mockResolvedValue(regularIdentity);
    await store.getIdentity();

    expect(listener).toHaveBeenCalled();
  });
});
