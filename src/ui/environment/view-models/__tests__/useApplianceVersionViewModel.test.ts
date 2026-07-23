import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { VersionInfo } from "../../../../models/VersionInfo";
import { OVA_RELEASE_NOTES_URL } from "../../constants";
import { useApplianceVersionViewModel } from "../useApplianceVersionViewModel";

const mockVersionInfo: VersionInfo = {
  ui: { name: "test", versionName: "v1", gitCommit: "" },
  api: { name: "api", versionName: "v2", gitCommit: "" },
  agent: { versionName: null, gitCommit: null },
};

let mockVersionsStore: {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  getApiVersionInfo: ReturnType<typeof vi.fn>;
};

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "VersionsStore") return mockVersionsStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

describe("useApplianceVersionViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockVersionsStore = {
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => mockVersionInfo),
      getApiVersionInfo: vi.fn().mockResolvedValue({
        ...mockVersionInfo,
        agent: { versionName: "v0.13.6", gitCommit: "abc123" },
      }),
    };
  });

  it("returns appliance version from the store snapshot", async () => {
    mockVersionsStore.getSnapshot.mockReturnValue({
      ...mockVersionInfo,
      agent: { versionName: "v0.13.6", gitCommit: "abc123" },
    });

    const { result } = renderHook(() => useApplianceVersionViewModel());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.displayVersion).toBe("v0.13.6");
    expect(result.current.releaseNotesUrl).toBe(OVA_RELEASE_NOTES_URL);
  });

  it("returns Unknown when agent version is not available", async () => {
    const { result } = renderHook(() => useApplianceVersionViewModel());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.displayVersion).toBe("Unknown");
  });

  it("calls getApiVersionInfo() on mount", async () => {
    renderHook(() => useApplianceVersionViewModel());

    await waitFor(() => {
      expect(mockVersionsStore.getApiVersionInfo).toHaveBeenCalledTimes(1);
    });
  });
});
