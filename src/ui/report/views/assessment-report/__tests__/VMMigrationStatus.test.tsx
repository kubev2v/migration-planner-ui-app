import "@testing-library/jest-dom";

import type { IssuesBreakdown } from "@openshift-migration-advisor/planner-sdk";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VMMigrationStatus } from "../VMMigrationStatus";

vi.mock("../../../../core/components/MigrationDonutChart", () => ({
  default: ({
    title,
    subTitle,
  }: {
    title: string;
    subTitle: string;
  }): JSX.Element => (
    <div data-testid="donut-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-subtitle">{subTitle}</div>
    </div>
  ),
}));

vi.mock("../../../../core/components/CardEmptyState", () => ({
  CardEmptyState: ({ title }: { title: string }): JSX.Element => (
    <div data-testid="empty-state">{title}</div>
  ),
}));

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
        <div data-testid="view-mode-dropdown">
          {typeof toggle === "function" ? toggle(null) : toggle}
          {isOpen && renderItems(children)}
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
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        data-testid={`view-mode-${value}`}
      >
        {children}
      </button>
    ),
  };
});

const baseData = {
  migratable: 80,
  nonMigratable: 20,
};

const issuesBreakdown: IssuesBreakdown = {
  critical: 12,
  error: 8,
  warning: 25,
  information: 10,
  advisory: 3,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("VMMigrationStatus", () => {
  it("renders the default donut chart view", () => {
    render(
      <VMMigrationStatus data={baseData} issuesBreakdown={issuesBreakdown} />,
    );

    expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart-title")).toHaveTextContent("100");
    expect(screen.getByTestId("chart-subtitle")).toHaveTextContent("VMs");
    expect(screen.getByText("No issues vs with issues")).toBeInTheDocument();
  });

  it("renders the issues breakdown chart without clickable bars", async () => {
    const user = userEvent.setup();

    render(
      <VMMigrationStatus data={baseData} issuesBreakdown={issuesBreakdown} />,
    );

    await user.click(screen.getByRole("button", { name: /No issues vs/i }));
    await user.click(screen.getByTestId("view-mode-issuesBreakdown"));

    expect(screen.queryByTestId("donut-chart")).not.toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(screen.getByText(/\(12 VMs\)/)).toBeInTheDocument();
    expect(screen.getByText(/Advisory/)).toBeInTheDocument();
    expect(screen.getByText(/\(3 VMs\)/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Totals may exceed the unique VM count because a VM can appear in multiple categories/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Critical: 12 VMs/i }),
    ).toBeNull();
  });

  it("shows an empty state when breakdown data is unavailable", async () => {
    const user = userEvent.setup();

    render(<VMMigrationStatus data={baseData} />);

    await user.click(screen.getByRole("button", { name: /No issues vs/i }));
    await user.click(screen.getByTestId("view-mode-issuesBreakdown"));

    expect(screen.getByTestId("empty-state")).toHaveTextContent(
      "Issues breakdown data not collected",
    );
  });

  it("hides the view mode dropdown in export mode", () => {
    render(
      <VMMigrationStatus
        data={baseData}
        issuesBreakdown={issuesBreakdown}
        isExportMode
      />,
    );

    expect(screen.queryByTestId("view-mode-dropdown")).not.toBeInTheDocument();
    expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
  });

  it("renders both views when exporting with exportAllViews", () => {
    render(
      <VMMigrationStatus
        data={baseData}
        issuesBreakdown={issuesBreakdown}
        isExportMode
        exportAllViews
      />,
    );

    expect(screen.queryByTestId("view-mode-dropdown")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("donut-chart")).toHaveLength(1);
    expect(screen.getByText("No issues vs with issues")).toBeInTheDocument();
    expect(screen.getByText("With issues breakdown")).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(screen.getByText(/\(12 VMs\)/)).toBeInTheDocument();
  });
});
