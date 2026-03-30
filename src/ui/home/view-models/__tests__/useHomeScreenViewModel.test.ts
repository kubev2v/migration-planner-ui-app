import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { routes } from "../../../../routing/Routes";
import { useHomeScreenViewModel } from "../useHomeScreenViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/assessments";
const mockNavigate = vi.fn();

let mockIdentityStore = {
  getIdentity: vi.fn().mockResolvedValue(null),
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => null),
};

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "IdentityStore") return mockIdentityStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useHomeScreenViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/assessments";

    mockIdentityStore = {
      getIdentity: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => null),
    };
  });

  it("activeTabKey is 0 when location.pathname does NOT start with /environments", () => {
    mockPathname = "/assessments";
    const { result } = renderHook(() => useHomeScreenViewModel());
    expect(result.current.activeTabKey).toBe(0);
  });

  it("activeTabKey is 1 when location.pathname starts with /environments", () => {
    mockPathname = "/environments";
    const { result } = renderHook(() => useHomeScreenViewModel());
    expect(result.current.activeTabKey).toBe(1);
  });

  it("breadcrumbs shows assessments when activeTabKey is 0", () => {
    mockPathname = "/assessments";
    const { result } = renderHook(() => useHomeScreenViewModel());
    const activeCrumb = result.current.breadcrumbs.find((b) => b.isActive);
    expect(activeCrumb?.children).toBe("assessments");
  });

  it("breadcrumbs shows environments when activeTabKey is 1", () => {
    mockPathname = "/environments";
    const { result } = renderHook(() => useHomeScreenViewModel());
    const activeCrumb = result.current.breadcrumbs.find((b) => b.isActive);
    expect(activeCrumb?.children).toBe("environments");
  });

  it("handleTabClick navigates to environments route when tabIndex is 1", () => {
    const { result } = renderHook(() => useHomeScreenViewModel());
    act(() => {
      result.current.handleTabClick({} as React.MouseEvent<HTMLElement>, 1);
    });
    expect(mockNavigate).toHaveBeenCalledWith(routes.environments);
  });

  it("handleTabClick navigates to assessments route when tabIndex is 0", () => {
    const { result } = renderHook(() => useHomeScreenViewModel());
    act(() => {
      result.current.handleTabClick({} as React.MouseEvent<HTMLElement>, 0);
    });
    expect(mockNavigate).toHaveBeenCalledWith(routes.assessments);
  });

  it("handleTabClick handles string tabIndex", () => {
    const { result } = renderHook(() => useHomeScreenViewModel());
    act(() => {
      result.current.handleTabClick({} as React.MouseEvent<HTMLElement>, "1");
    });
    expect(mockNavigate).toHaveBeenCalledWith(routes.environments);
  });

  it("handleOpenRVToolsModal sets rvtoolsOpenToken to true and navigates to assessments", () => {
    const { result } = renderHook(() => useHomeScreenViewModel());
    expect(result.current.rvtoolsOpenToken).toBe(false);

    act(() => {
      result.current.handleOpenRVToolsModal();
    });
    expect(result.current.rvtoolsOpenToken).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(routes.assessments);
  });
});
