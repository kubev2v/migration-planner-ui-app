import "@testing-library/jest-dom";

import type {
  DiskSizeTierSummary,
  DiskTypeSummary,
} from "@openshift-migration-advisor/planner-sdk";
import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StorageOverview } from "../StorageOverview";

// Mock MigrationDonutChart
vi.mock("../../../../core/components/MigrationDonutChart", () => ({
  default: ({
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
}));

// Mock PatternFly Chart components
vi.mock("@patternfly/react-charts", () => ({
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
      isOpen,
      onSelect,
    }: {
      children?: React.ReactNode;
      toggle?: React.ReactNode | ((ref: React.Ref<unknown>) => React.ReactNode);
      isOpen?: boolean;
      onSelect?: (
        event: React.MouseEvent<Element, MouseEvent> | undefined,
        value: string | number | undefined,
      ) => void;
    }) => {
      const handleItemClick = (value: string) => {
        if (onSelect) {
          onSelect(undefined, value);
        }
      };

      return (
        <div data-testid="dropdown">
          {typeof toggle === "function" ? toggle(null) : toggle}
          {isOpen &&
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement, {
                  onClick: () => {
                    const value = (
                      child as React.ReactElement<{ value?: string }>
                    ).props.value;
                    if (value) {
                      handleItemClick(value);
                    }
                  },
                });
              }
              return child;
            })}
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
    }: {
      children?: React.ReactNode;
      value?: string;
      onClick?: () => void;
    }) => (
      <button role="menuitem" onClick={onClick} data-value={value}>
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
      expect(screen.getByText(/Disks/i)).toBeInTheDocument();
    });

    it("includes shared disks chart in export mode", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      expect(
        screen.getByText(/Shared disks VS\. No shared disks/i),
      ).toBeInTheDocument();

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChartIndex = donutCharts.findIndex((chart) => {
        const title = chart.querySelector('[data-testid="chart-title"]');
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return (
          title?.textContent === "100 VMs" &&
          subtitle?.textContent === "25 with shared disks"
        );
      });

      expect(sharedDisksChartIndex).toBeGreaterThan(-1);
    });

    it("calculates shared disks data correctly in export mode", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const title = chart.querySelector('[data-testid="chart-title"]');
        return title?.textContent === "100 VMs";
      });

      expect(sharedDisksChart).toBeDefined();

      const chartData = sharedDisksChart!.querySelector(
        '[data-testid="chart-data"]',
      );
      const data = JSON.parse(
        chartData!.textContent || "[]",
      ) as ChartDataItem[];

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

    it("handles zero VMs with shared disks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={0}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return subtitle?.textContent === "0 with shared disks";
      });

      expect(sharedDisksChart).toBeDefined();

      const chartData = sharedDisksChart!.querySelector(
        '[data-testid="chart-data"]',
      );
      const data = JSON.parse(
        chartData!.textContent || "[]",
      ) as ChartDataItem[];

      expect(data.length).toBeGreaterThan(0);
      const withoutShared = data.find((d) => d.name === "No shared disks");
      expect(withoutShared).toMatchObject({
        count: 100,
      });
    });

    it("handles all VMs with shared disks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={100}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return subtitle?.textContent === "100 with shared disks";
      });

      expect(sharedDisksChart).toBeDefined();

      const chartData = sharedDisksChart!.querySelector(
        '[data-testid="chart-data"]',
      );
      const data = JSON.parse(
        chartData!.textContent || "[]",
      ) as ChartDataItem[];

      expect(data.length).toBeGreaterThan(0);
      const withShared = data.find((d) => d.name === "With shared disks");
      expect(withShared).toMatchObject({
        count: 100,
      });
    });

    it("handles undefined totalWithSharedDisks", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={undefined}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return subtitle?.textContent?.includes("with shared disks");
      });

      expect(sharedDisksChart).toBeDefined();
    });

    it("clamps totalWithSharedDisks to valid range", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={150}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return subtitle?.textContent === "100 with shared disks";
      });

      expect(sharedDisksChart).toBeDefined();

      const chartData = sharedDisksChart!.querySelector(
        '[data-testid="chart-data"]',
      );
      const data = JSON.parse(
        chartData!.textContent || "[]",
      ) as ChartDataItem[];

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
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      const sharedDisksChart = donutCharts.find((chart) => {
        const subtitle = chart.querySelector('[data-testid="chart-subtitle"]');
        return subtitle?.textContent === "0 with shared disks";
      });

      expect(sharedDisksChart).toBeDefined();

      const chartData = sharedDisksChart!.querySelector(
        '[data-testid="chart-data"]',
      );
      const data = JSON.parse(
        chartData!.textContent || "[]",
      ) as ChartDataItem[];

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

    it("includes all views in export mode", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      expect(screen.getByText(/VM count by disk type/i)).toBeInTheDocument();
      expect(
        screen.getByText(/VM count by disk size tier/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Total disk size by tier/i)).toBeInTheDocument();

      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      const donutCharts = screen.getAllByTestId("donut-chart");
      expect(donutCharts.length).toBeGreaterThanOrEqual(3);
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

  describe("Export Mode", () => {
    it("renders all views including shared disks when exportAllViews is true", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
          isExportMode={true}
          exportAllViews={true}
        />,
      );

      const donutCharts = screen.getAllByTestId("donut-chart");
      expect(donutCharts.length).toBeGreaterThanOrEqual(3);

      expect(screen.getByText(/VM count by disk type/i)).toBeInTheDocument();
      expect(
        screen.getByText(/VM count by disk size tier/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Total disk size by tier/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Shared disks VS\. No shared disks/i),
      ).toBeInTheDocument();
    });

    it("hides dropdown in export mode", () => {
      render(
        <StorageOverview
          DiskSizeTierSummary={mockDiskSizeTierSummary}
          diskTypeSummary={mockDiskTypeSummary}
          totalVMs={100}
          totalWithSharedDisks={25}
          isExportMode={true}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /VM count by disk size tier/i }),
      ).not.toBeInTheDocument();
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

      expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    });

    it("handles missing optional props with defaults", () => {
      render(<StorageOverview DiskSizeTierSummary={mockDiskSizeTierSummary} />);

      expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    });
  });
});
