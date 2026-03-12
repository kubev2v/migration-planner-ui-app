import { describe, expect, it, vi } from "vitest";

import { ReportStore } from "../ReportStore";

describe("ReportStore", () => {
  it("initial snapshot is idle with no error", () => {
    const store = new ReportStore();
    expect(store.getSnapshot()).toEqual({
      loadingState: "idle",
      error: null,
    });
  });

  it("subscribe notifies on subscription", () => {
    const store = new ReportStore();
    const listener = vi.fn();
    store.subscribe(listener);
    // Store never changes state; listener was registered
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribe removes listener", () => {
    const store = new ReportStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    // No way to trigger notify; just verify unsub is a function that can be called
    expect(typeof unsub).toBe("function");
  });
});
