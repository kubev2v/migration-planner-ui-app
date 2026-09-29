import "@testing-library/jest-dom";

import type {
  DiskSizeTierSummary,
  DiskTypeSummary,
} from "@openshift-migration-advisor/planner-sdk";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StorageOverview } from "../StorageOverview";

vi.mock(
  "@openshift-migration-advisor/shared-components",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@openshift-migration-advisor/shared-components")
      >();

    return {
      ...actual,
      MigrationDonutChart: ({
        data,
        title,
        subTitle,
      }: {
        data: Array<{ name: string; count: number }>;
        title: string;
        subTitle: string;
      }): JSX.Element => (
        <div data-testid="donut-chart">
          <div data-testid="chart-title">{title}</div>
          <div data-testid="chart-subtitle">{subTitle}</div>
          <div data-testid="chart-data">{JSON.stringify(data)}</div>
        </div>
      ),
    };
  },
);

// Mock PatternFly Chart components
vi.mock("@patternfly/react-charts/victory", () => ({
  Chart: ({
    ariaTitle,
    children,
  }: {
    ariaTitle: string;
    children?: React.ReactNode;
  }): JSX.Element => (
    <div data-testid="bar-chart" aria-label={ariaTitle}>
      {children}
    </div>
  ),
  ChartAxis: (): null => null,
  ChartBar: ({
    data,
  }: {
    data: Array<{ x: string; y: number }>;
  }): JSX.Element => (
    <div data-testid="bar-chart-data">{JSON.stringify(data)}</div>
  ),
  ChartThemeColor: { multiUnordered: "multiUnordered" },
  ChartTooltip: (): null => null,
  ChartVoronoiContainer: ({
    children,
  }: {
    children?: React.ReactNode;
  }): JSX.Element => <div>{children}</div>,
  getCustomTheme: vi.fn(() => ({})),
}));

// Mock Dropdown to render children directly and handle selection
vi.mock("@patternfly/react-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@patternfly/react-core")>();

  return {
    ...actual,
    Dropdown: ({
      children,
      toggle,
      onSelect,
    }: {
      children?: React.ReactNode;
      toggle?: React.ReactNode | ((ref: React.Ref<unknown>) => React.ReactNode);
      onSelect?: (
        event: React.MouseEvent<Element, MouseEvent> | undefined,
        value: string | number | undefined,
      ) => void;
    }) => {
      const renderItems = (nodes: React.ReactNode): React.ReactNode =>
        React.Children.map(nodes, (child) => {
          if (!React.isValidElement(child)) {
            return child;
          }

          const value = (child.props as { value?: string }).value;
          if (value) {
            return React.cloneElement(child, {
              onClick: () => onSelect?.(undefined, value),
            } as Partial<unknown>);
          }

          return React.cloneElement(child, {
            children: renderItems(
              (child.props as { children?: React.ReactNode }).children,
            ),
          } as Partial<unknown>);
        });

      return (
        <div data-testid="dropdown">
          {typeof toggle === "function" ? toggle(null) : toggle}
          {renderItems(children)}
        </div>
      );
    },
    DropdownList: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownItem: ({
      children,
      value,
      onClick,
      isDisabled,
    }: {
      children?: React.ReactNode;
      value?: string;
      onClick?: () => void;
      isDisabled?: boolean;
    }) => (
      <button
        role="menuitem"
        onClick={onClick}
        data-value={value}
        disabled={isDisabled}
      >
        {children}
      </button>
    ),
  };
});

const mockDiskSizeTierSummary: { [key: string]: DiskSizeTierSummary } = {
  Easy: {
    vmCount: 10,
    totalSizeTB: 5.5,
  },
  Medium: {
    vmCount: 5,
    totalSizeTB: 15.0,
  },
};

const mockDiskTypeSummary: { [key: string]: DiskTypeSummary } = {
  VMFS: {
    vmCount: 8,
    totalSizeTB: 0,
  },
  NFS: {
    vmCount: 5,
    totalSizeTB: 0,
  },
  vSAN: {
    vmCount: 2,
    totalSizeTB: 0,
  },
};

type ChartDataItem = {
  name: string;
  count: number;
  countDisplay?: string;
  legendCategory?: string;
};

const selectSharedDisksView = (): void => {
  fireEvent.click(
    screen.getByRole("menuitem", {
      name: /Shared disks VS\. No shared disks/i,
    }),
  );
};

const readSharedDisksChart = (): ChartDataItem[] => {
  const donutCharts = screen.getAllByTestId("donut-chart");
  const sharedDisksChart = donutCharts.find((chart) => {
    const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
    return subtitle?.textContent?.includes("with shared disks");
  });
  const chartData = sharedDisksChart?.querySelector(
    '[data-testid="chart-data"]',
  );
  return JSON.parse(chartData?.textContent || "[]") as ChartDataItem[];
};

describe("StorageOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Shared Disks Chart", () => {
    it("renders component with shared disks data", () => {
      const { container } = render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
        />,
      );

      expect(container.querySelector("#storage-overview")).toBeInTheDocument();
      expect(screen.getByText(/^Disks$/)).toBeInTheDocument();
    });

    it("includes shared disks chart when that view is selected", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
        />,
      );

      selectSharedDisksView();

      expect(screen.getByTestId("chart-title")).toHaveTextContent("100 VMs");
      expect(screen.getByTestId("chart-subtitle")).toHaveTextContent(
        "25 with shared disks",
      );
    });

    it("calculates shared disks data correctly", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
        />,
      );

      selectSharedDisksView();
      const data = readSharedDisksChart();

      const withShared = data.find((d) => d.name === "With shared disks");
      const withoutShared = data.find((d) => d.name === "No shared disks");

      expect(withShared).toMatchObject({
        count: 25,
        countDisplay: "25 VMs",
      });
      expect(withoutShared).toMatchObject({
        count: 75,
        countDisplay: "75 VMs",
      });
    });

    it("disables the shared disks view when there are no shared disks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={0}
        />,
      );

      expect(
        screen.getByRole("menuitem", {
          name: /Shared disks VS\. No shared disks/i,
        }),
      ).toBeDisabled();
      expect(screen.queryByTestId("chart-subtitle")).not.toHaveTextContent(
        "with shared disks",
      );
    });

    it("handles all VMs with shared disks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={100}
        />,
      );

      selectSharedDisksView();
      const data = readSharedDisksChart();

      expect(data.length).toBeGreaterThan(0);
      const withShared = data.find((d) => d.name === "With shared disks");
      expect(withShared).toMatchObject({
        count: 100,
      });
    });

    it("disables the shared disks view when totalWithSharedDisks is undefined", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={undefined}
        />,
      );

      expect(
        screen.getByRole("menuitem", {
          name: /Shared disks VS\. No shared disks/i,
        }),
      ).toBeDisabled();
    });

    it("clamps totalWithSharedDisks to valid range", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={150}
        />,
      );

      selectSharedDisksView();
      const data = readSharedDisksChart();

      const withShared = data.find((d) => d.name === "With shared disks");
      expect(withShared?.count).toBe(100);
    });

    it("handles negative totalWithSharedDisks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={-10}
        />,
      );

      selectSharedDisksView();
      const data = readSharedDisksChart();

      expect(data).toHaveLength(1);
      const withoutShared = data.find((d) => d.name === "No shared disks");
      expect(withoutShared?.count).toBe(100);
    });
  });

  describe("Existing Views", () => {
    it("renders VM count by disk size tier by default", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
        />,
      );

      expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
      expect(screen.getByTestId("chart-title")).toHaveTextContent("15 VMs");
    });

    it("renders toggle button for view selection", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
        />,
      );

      expect(
        screen.getByRole("button", { name: /VM count by disk size tier/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty DiskSizeTierSummary", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={{}}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={0}
          totalWithSharedDisks={0}
        />,
      );

      expect(
        screen.getByText("Storage data not collected"),
      ).toBeInTheDocument();
    });

    it("handles missing optional props with defaults", () => {
      render(<StorageOverview DiskSizeTierSummary={mockDiskSizeTierSummary} />);

      expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    });
  });
});
