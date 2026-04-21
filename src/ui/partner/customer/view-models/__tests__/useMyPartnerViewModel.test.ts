import type { Group } from "@openshift-migration-advisor/planner-sdk";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFakeIdentity } from "../../../../../data/stubs/stubIdentity";
import { useMyPartnerViewModel } from "../useMyPartnerViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockAccountStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
};

let mockGroupsStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "AccountStore") return mockAccountStore;
    if (key === "GroupsStore") return mockGroupsStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useMyPartnerViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch partner group when identity has partnerId", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockPartnerGroup: Group = {
      id: "partner-1",
      name: "Test Partner",
      description: "A test partner group",
      kind: "partner",
      company: "Test Company",
      icon: "test-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const unsubscribe = vi.fn();
    const cachedGroups: Group[] = [];

    mockAccountStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockGroupsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedGroups),
      get: vi.fn().mockResolvedValue(mockPartnerGroup),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGroupsStore.get).toHaveBeenCalledWith(mockIdentity.partnerId);
    expect(result.current.partnerGroup).toEqual(mockPartnerGroup);
    expect(result.current.error).toBeUndefined();
  });

  it("should not fetch when identity has no partnerId", async () => {
    const mockIdentity = getFakeIdentity("regular");

    const unsubscribe = vi.fn();
    const cachedGroups: Group[] = [];

    mockAccountStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockGroupsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedGroups),
      get: vi.fn().mockResolvedValue(null),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGroupsStore.get).not.toHaveBeenCalled();
    expect(result.current.partnerGroup).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should not fetch when identity is null", async () => {
    const unsubscribe = vi.fn();
    const cachedGroups: Group[] = [];

    mockAccountStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => null),
    };

    mockGroupsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedGroups),
      get: vi.fn().mockResolvedValue(null),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGroupsStore.get).not.toHaveBeenCalled();
    expect(result.current.partnerGroup).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle error when fetch fails", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockError = new Error("Failed to fetch group");

    const unsubscribe = vi.fn();
    const cachedGroups: Group[] = [];

    mockAccountStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockGroupsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedGroups),
      get: vi.fn().mockRejectedValue(mockError),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGroupsStore.get).toHaveBeenCalledWith(mockIdentity.partnerId);
    expect(result.current.partnerGroup).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });

  it("should show loading state while fetching", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockPartnerGroup: Group = {
      id: "partner-1",
      name: "Test Partner",
      description: "A test partner group",
      kind: "partner",
      company: "Test Company",
      icon: "test-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const unsubscribe = vi.fn();
    const cachedGroups: Group[] = [];

    mockAccountStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockGroupsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedGroups),
      get: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockPartnerGroup), 100);
          }),
      ),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    // Initially should be loading
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.partnerGroup).toBeUndefined();

    // Wait for the fetch to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 200 },
    );

    expect(result.current.partnerGroup).toEqual(mockPartnerGroup);
  });
});
