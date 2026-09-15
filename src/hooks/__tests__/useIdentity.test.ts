import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IdentityView } from "../../data/stores/interfaces/IAccountStore";
import { useIdentity, useIsPartner } from "../useIdentity";

const mockAccountStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn((): IdentityView | null => null),
};

vi.mock("@openshift-migration-advisor/ioc", () => ({
  useInjection: vi.fn((symbol: symbol) => {
    if (symbol.description === "AccountStore") return mockAccountStore;
    throw new Error(`Unknown symbol: ${String(symbol)}`);
  }),
}));

const partnerIdentity: IdentityView = {
  username: "partner-user",
  kind: "partner",
  groupId: "group-1",
  partnerId: null,
  isPartner: true,
};

const regularIdentity: IdentityView = {
  username: "regular-user",
  kind: "regular",
  groupId: null,
  partnerId: null,
  isPartner: false,
};

describe("useIdentity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountStore.getSnapshot.mockReturnValue(null);
  });

  it("returns null before the identity is resolved", () => {
    const { result } = renderHook(() => useIdentity());
    expect(result.current).toBeNull();
  });

  it("returns the current identity from the account store", () => {
    mockAccountStore.getSnapshot.mockReturnValue(partnerIdentity);
    const { result } = renderHook(() => useIdentity());
    expect(result.current).toEqual(partnerIdentity);
  });
});

describe("useIsPartner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountStore.getSnapshot.mockReturnValue(null);
  });

  it("is false when there is no identity", () => {
    const { result } = renderHook(() => useIsPartner());
    expect(result.current).toBe(false);
  });

  it("is false for a non-partner identity", () => {
    mockAccountStore.getSnapshot.mockReturnValue(regularIdentity);
    const { result } = renderHook(() => useIsPartner());
    expect(result.current).toBe(false);
  });

  it("is true for a partner identity", () => {
    mockAccountStore.getSnapshot.mockReturnValue(partnerIdentity);
    const { result } = renderHook(() => useIsPartner());
    expect(result.current).toBe(true);
  });
});
