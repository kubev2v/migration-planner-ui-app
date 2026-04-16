import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFakeIdentity } from "../../../../../data/stubs/stubIdentity";
import type { PartnerRequestValues } from "../../../../../models/PartnerRequestModel";
import { usePartnersViewModel } from "../usePartnersViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPartnersStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
};

let mockPartnerRequestsStore: {
  create: ReturnType<typeof vi.fn>;
};

let mockAccountStore: {
  getSnapshot: ReturnType<typeof vi.fn>;
};

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "PartnersStore") return mockPartnersStore;
    if (key === "PartnerRequestsStore") return mockPartnerRequestsStore;
    if (key === "AccountStore") return mockAccountStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePartnersViewModel - createPartnerRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a partner request when identity exists", async () => {
    const mockIdentity = getFakeIdentity("regular");
    const mockPartnerRequestValues: PartnerRequestValues = {
      partnerId: "partner-1",
      customerName: "Test Customer",
      customerPointOfContactName: "John Doe",
      contactPhone: "+1234567890",
      email: "john.doe@example.com",
      vcenterGeoLocation: "US-East",
    };

    const unsubscribe = vi.fn();
    const cachedPartners: unknown[] = [];
    mockPartnersStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedPartners),
      list: vi.fn().mockResolvedValue(undefined),
    };

    mockPartnerRequestsStore = {
      create: vi.fn().mockResolvedValue(undefined),
    };

    mockAccountStore = {
      getSnapshot: vi.fn(() => mockIdentity),
    };

    const { result } = renderHook(() => usePartnersViewModel());

    // Wait for initial useAsync to complete
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.createPartnerRequest(mockPartnerRequestValues);
    });

    expect(mockPartnerRequestsStore.create).toHaveBeenCalledWith({
      username: mockIdentity.username,
      request: mockPartnerRequestValues,
    });
  });

  it("should throw an error when no identity is found", async () => {
    const mockPartnerRequestValues: PartnerRequestValues = {
      partnerId: "partner-1",
      customerName: "Test Customer",
      customerPointOfContactName: "John Doe",
      contactPhone: "+1234567890",
      email: "john.doe@example.com",
      vcenterGeoLocation: "US-East",
    };

    const unsubscribe = vi.fn();
    const cachedPartners: unknown[] = [];
    mockPartnersStore = {
      subscribe: vi.fn(() => unsubscribe),
      getSnapshot: vi.fn(() => cachedPartners),
      list: vi.fn().mockResolvedValue(undefined),
    };

    mockPartnerRequestsStore = {
      create: vi.fn().mockResolvedValue(undefined),
    };

    mockAccountStore = {
      getSnapshot: vi.fn(() => null),
    };

    const { result } = renderHook(() => usePartnersViewModel());

    // Wait for initial useAsync to complete
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await expect(
        result.current.createPartnerRequest(mockPartnerRequestValues),
      ).rejects.toThrow("No identity found");
    });

    expect(mockPartnerRequestsStore.create).not.toHaveBeenCalled();
  });
});
