import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFakeIdentity } from "../../../../../data/stubs/stubIdentity";
import type { Organization } from "../../../../../models/OrganizationModel";
import { useMyPartnerViewModel } from "../useMyPartnerViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockIdentityStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
};

let mockOrganizationsStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "IdentityStore") return mockIdentityStore;
    if (key === "OrganizationsStore") return mockOrganizationsStore;
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

  it("should fetch partner organization when identity has partnerId", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockPartnerOrganization: Organization = {
      id: "partner-1",
      name: "Test Partner",
      description: "A test partner organization",
      kind: "partner",
      company: "Test Company",
      icon: "test-icon",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const unsubscribe = vi.fn();
    const cachedOrganizations: Organization[] = [];

    mockIdentityStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockOrganizationsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedOrganizations),
      get: vi.fn().mockResolvedValue(mockPartnerOrganization),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockOrganizationsStore.get).toHaveBeenCalledWith(
      mockIdentity.partnerId,
    );
    expect(result.current.partnerOrganization).toEqual(mockPartnerOrganization);
    expect(result.current.error).toBeUndefined();
  });

  it("should not fetch when identity has no partnerId", async () => {
    const mockIdentity = getFakeIdentity("regular");

    const unsubscribe = vi.fn();
    const cachedOrganizations: Organization[] = [];

    mockIdentityStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockOrganizationsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedOrganizations),
      get: vi.fn().mockResolvedValue(null),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOrganizationsStore.get).not.toHaveBeenCalled();
    expect(result.current.partnerOrganization).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should not fetch when identity is null", async () => {
    const unsubscribe = vi.fn();
    const cachedOrganizations: Organization[] = [];

    mockIdentityStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => null),
    };

    mockOrganizationsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedOrganizations),
      get: vi.fn().mockResolvedValue(null),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOrganizationsStore.get).not.toHaveBeenCalled();
    expect(result.current.partnerOrganization).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle error when fetch fails", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockError = new Error("Failed to fetch organization");

    const unsubscribe = vi.fn();
    const cachedOrganizations: Organization[] = [];

    mockIdentityStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockOrganizationsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedOrganizations),
      get: vi.fn().mockRejectedValue(mockError),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockOrganizationsStore.get).toHaveBeenCalledWith(
      mockIdentity.partnerId,
    );
    expect(result.current.partnerOrganization).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });

  it("should show loading state while fetching", async () => {
    const mockIdentity = getFakeIdentity("customer");
    const mockPartnerOrganization: Organization = {
      id: "partner-1",
      name: "Test Partner",
      description: "A test partner organization",
      kind: "partner",
      company: "Test Company",
      icon: "test-icon",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const unsubscribe = vi.fn();
    const cachedOrganizations: Organization[] = [];

    mockIdentityStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockOrganizationsStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedOrganizations),
      get: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockPartnerOrganization), 100);
          }),
      ),
    };

    const { result } = renderHook(() => useMyPartnerViewModel());

    // Initially should be loading
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.partnerOrganization).toBeUndefined();

    // Wait for the fetch to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 200 },
    );

    expect(result.current.partnerOrganization).toEqual(mockPartnerOrganization);
  });
});
