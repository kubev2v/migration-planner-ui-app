import type {
  Identity,
  PartnerRequest,
} from "@openshift-migration-advisor/planner-sdk";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { routes } from "../../../../routing/Routes";
import { useHomeScreenViewModel } from "../useHomeScreenViewModel";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/assessments";
const mockNavigate = vi.fn();

const mockIdentity = null;
const mockPartnerRequests: PartnerRequest[] = [];

let mockAccountStore = {
  getIdentity: vi.fn().mockResolvedValue(null),
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => mockIdentity),
};

let mockPartnerRequestsStore = {
  list: vi.fn().mockResolvedValue([]),
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => mockPartnerRequests),
};

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@y0n1/react-ioc", () => ({
  useInjection: (symbol: symbol) => {
    const key = symbol.description;
    if (key === "AccountStore") return mockAccountStore;
    if (key === "PartnerRequestsStore") return mockPartnerRequestsStore;
    throw new Error(`Unexpected symbol: ${String(symbol)}`);
  },
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const createMockIdentity = (kind: Identity["kind"]): Identity => ({
  username: "test-user",
  kind,
  groupId: "group-1",
  partnerId: null,
});

const createMockPartnerRequest = (
  status: PartnerRequest["requestStatus"],
): PartnerRequest =>
  ({
    id: `request-${status}`,
    requestStatus: status,
    partner: {
      id: "partner-1",
      name: "Partner 1",
    },
  }) as PartnerRequest;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useHomeScreenViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/assessments";

    mockAccountStore = {
      getIdentity: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => mockIdentity),
    };

    mockPartnerRequestsStore = {
      list: vi.fn().mockResolvedValue([]),
      subscribe: vi.fn(() => () => {}),
      getSnapshot: vi.fn(() => mockPartnerRequests),
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

  describe("Partner badge functionality", () => {
    it("shouldShowBadge is true when identity.kind is partner", async () => {
      const unsubscribe = vi.fn();
      const partnerIdentity = createMockIdentity("partner");
      const emptyRequests: PartnerRequest[] = [];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(partnerIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(emptyRequests),
        list: vi.fn().mockResolvedValue(emptyRequests),
      };

      const { result } = renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.shouldShowBadge).toBe(true);
    });

    it("shouldShowBadge is false when identity.kind is not partner", async () => {
      const unsubscribe = vi.fn();
      const regularIdentity = createMockIdentity("regular");
      const emptyRequests: PartnerRequest[] = [];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(regularIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(emptyRequests),
        list: vi.fn().mockResolvedValue(emptyRequests),
      };

      const { result } = renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.shouldShowBadge).toBe(false);
    });

    it("pendingRequestsCount counts pending requests", async () => {
      const unsubscribe = vi.fn();
      const partnerIdentity = createMockIdentity("partner");
      const requests: PartnerRequest[] = [
        createMockPartnerRequest("pending"),
        createMockPartnerRequest("pending"),
        createMockPartnerRequest("accepted"),
        createMockPartnerRequest("rejected"),
        createMockPartnerRequest("cancelled"),
      ];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(partnerIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(requests),
        list: vi.fn().mockResolvedValue(requests),
      };

      const { result } = renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.pendingRequestsCount).toBe(2);
    });

    it("pendingRequestsCount is 0 when there are no pending requests", async () => {
      const unsubscribe = vi.fn();
      const partnerIdentity = createMockIdentity("partner");
      const requests: PartnerRequest[] = [
        createMockPartnerRequest("accepted"),
        createMockPartnerRequest("rejected"),
      ];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(partnerIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(requests),
        list: vi.fn().mockResolvedValue(requests),
      };

      const { result } = renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.shouldShowBadge).toBe(true);
      expect(result.current.pendingRequestsCount).toBe(0);
    });
    it("calls partnerRequestsStore.list on mount if partner", async () => {
      const unsubscribe = vi.fn();
      const partnerIdentity = createMockIdentity("partner");
      const emptyRequests: PartnerRequest[] = [];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(partnerIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(emptyRequests),
        list: vi.fn().mockResolvedValue(emptyRequests),
      };

      renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockPartnerRequestsStore.list).toHaveBeenCalledTimes(1);
    });
    it("don't calls partnerRequestsStore.list on mount if not partner", async () => {
      const unsubscribe = vi.fn();
      const partnerIdentity = createMockIdentity("regular");
      const emptyRequests: PartnerRequest[] = [];

      mockAccountStore = {
        getIdentity: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(partnerIdentity),
      };

      mockPartnerRequestsStore = {
        subscribe: vi.fn(() => unsubscribe),
        getSnapshot: vi.fn().mockReturnValue(emptyRequests),
        list: vi.fn().mockResolvedValue(emptyRequests),
      };

      renderHook(() => useHomeScreenViewModel());

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockPartnerRequestsStore.list).not.toHaveBeenCalled();
    });
  });
});
