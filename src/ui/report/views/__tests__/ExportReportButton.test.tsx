import { ChartExportProvider } from "@openshift-migration-advisor/shared-components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExportReportButton } from "../ExportReportButton";

const downloadPdf = vi.fn();
const downloadAll = vi.fn();
const downloadHtml = vi.fn();

vi.mock(
  "@openshift-migration-advisor/shared-components",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@openshift-migration-advisor/shared-components")
      >();

    return {
      ...actual,
      useChartExport: () => ({
        downloadPdf,
        downloadAll,
        downloadHtml,
        isBusy: false,
        exportLoadingLabel: null,
        exportError: null,
        clearExportError: vi.fn(),
        downloadChart: vi.fn(),
        downloadingChartId: null,
        exportingFormat: null,
        isExportingAll: false,
      }),
    };
  },
);

vi.mock("@patternfly/react-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@patternfly/react-core")>();

  return {
    ...actual,
    Dropdown: ({
      children,
      toggle,
    }: {
      children?: React.ReactNode;
      toggle?: React.ReactNode | ((ref: React.Ref<unknown>) => React.ReactNode);
    }) => (
      <div>
        {typeof toggle === "function" ? toggle(null) : toggle}
        {children}
      </div>
    ),
  };
});

describe("ExportReportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderButton = (
    props?: Partial<React.ComponentProps<typeof ExportReportButton>>,
  ): void => {
    render(
      <ChartExportProvider>
        <ExportReportButton
          documentTitle="Assessment 1 - vCenter report"
          {...props}
        />
      </ChartExportProvider>,
    );
  };

  it("renders dropdown with Export Report toggle", () => {
    renderButton();

    expect(
      screen.getByRole("button", { name: /export report/i }),
    ).toBeInTheDocument();
  });

  it("shows PDF, HTML, and PNG options", () => {
    renderButton();

    expect(screen.getByRole("menuitem", { name: /pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /html/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /png/i })).toBeInTheDocument();
  });

  it("calls downloadPdf when PDF option is clicked", () => {
    renderButton();

    act(() => {
      fireEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));
    });

    expect(downloadPdf).toHaveBeenCalledWith(
      "Assessment 1 - vCenter report",
      undefined,
    );
  });

  it("forwards calculated cluster sizing recommendations to downloadPdf", () => {
    const pdfExtraPages = [
      {
        title: "Cluster sizing recommendations — Cluster A",
        items: [{ label: "Cluster name", value: "Cluster A" }],
      },
    ];

    renderButton({ pdfExtraPages });

    act(() => {
      fireEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));
    });

    expect(downloadPdf).toHaveBeenCalledWith(
      "Assessment 1 - vCenter report",
      pdfExtraPages,
    );
  });

  it("calls downloadHtml when HTML option is clicked", () => {
    renderButton();

    act(() => {
      fireEvent.click(screen.getByRole("menuitem", { name: /html/i }));
    });

    expect(downloadHtml).toHaveBeenCalledWith("Assessment 1 - vCenter report");
  });

  it("calls downloadAll when PNG option is clicked", () => {
    renderButton();

    act(() => {
      fireEvent.click(screen.getByRole("menuitem", { name: /png/i }));
    });

    expect(downloadAll).toHaveBeenCalledTimes(1);
  });

  it("disables toggle when isDisabled is true", () => {
    renderButton({ isDisabled: true });

    const toggle = screen.getByRole("button", { name: /export report/i });
    expect(toggle).toBeDisabled();
  });
});
