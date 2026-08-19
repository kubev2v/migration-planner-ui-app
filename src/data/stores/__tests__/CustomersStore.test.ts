import type {
  Customer,
  PartnerApiInterface,
} from "@openshift-migration-advisor/planner-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomersStore } from "../CustomersStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  username: "user-1",
  name: "Test Customer",
  contactName: "John Doe",
  contactPhone: "+1-555-0123",
  email: "john@example.com",
  location: "us-east-1",
  ...overrides,
});

const createMockApi = (): PartnerApiInterface =>
  ({
    listCustomers: vi.fn(),
    removeCustomer: vi.fn(),
  }) as unknown as PartnerApiInterface;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CustomersStore", () => {
  let api: PartnerApiInterface;
  let store: CustomersStore;

  beforeEach(() => {
    api = createMockApi();
    store = new CustomersStore(api);
  });

  it("initial snapshot is empty array", () => {
    expect(store.getSnapshot()).toEqual([]);
  });

  it("list() fetches customers and updates snapshot", async () => {
    const customers = [
      makeCustomer({ username: "user-1" }),
      makeCustomer({ username: "user-2" }),
    ];
    vi.mocked(api.listCustomers).mockResolvedValue(customers);

    const result = await store.list();

    expect(api.listCustomers).toHaveBeenCalled();
    expect(result).toEqual(customers);
    expect(store.getSnapshot()).toEqual(customers);
  });

  it("remove() deletes customer and refreshes list", async () => {
    const customers = [
      makeCustomer({ username: "user-1" }),
      makeCustomer({ username: "user-2" }),
    ];
    vi.mocked(api.listCustomers).mockResolvedValue(customers);
    await store.list();

    const afterRemove = [makeCustomer({ username: "user-2" })];
    vi.mocked(api.listCustomers).mockResolvedValue(afterRemove);
    vi.mocked(api.removeCustomer).mockResolvedValue(undefined);

    await store.remove("user-1");

    expect(api.removeCustomer).toHaveBeenCalledWith({ username: "user-1" });
    expect(api.listCustomers).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot()).toEqual(afterRemove);
  });

  it("subscriber notification on remove()", async () => {
    vi.mocked(api.listCustomers).mockResolvedValue([]);
    vi.mocked(api.removeCustomer).mockResolvedValue(undefined);

    const listener = vi.fn();
    store.subscribe(listener);

    await store.remove("user-1");

    expect(listener).toHaveBeenCalled();
  });
});
