import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFakeIdentity } from "../../../../data/stubs/stubIdentity";
import { useIdentityViewModel } from "../useIdentityViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockAccountStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  getIdentity: ReturnType<typeof vi.fn>;
};

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "AccountStore") return mockAccountStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useUserViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user from the store snapshot", async () => {
    const mockIdentity = getFakeIdentity("admin");
    mockAccountStore = {
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => mockIdentity),
      getIdentity: vi.fn().mockResolvedValue(mockIdentity),
    };

    const { result } = renderHook(() => useIdentityViewModel());
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.identity).toEqual(mockIdentity);
  });
});
