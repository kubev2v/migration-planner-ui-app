import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHART_EXPORT_ATTR } from "../../../../../services/png-export/PngExportService";
import { ReportChartExportProvider } from "../../../view-models/ReportChartExportContext";
import {
  ChartCardHeaderActions,
  ChartExportCard,
  ChartPngDownloadButton,
} from "../ChartPngDownloadButton";

describe("ChartPngDownloadButton", () => {
  const exportPngChart = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render without an export provider", () => {
    render(<ChartPngDownloadButton />);
    expect(
      screen.queryByRole("button", { name: /download chart as png/i }),
    ).not.toBeInTheDocument();
  });

  it("downloads the nearest chart card", async () => {
    render(
      <ReportChartExportProvider
        exportPngChart={exportPngChart}
        isExporting={false}
      >
        <article data-chart-export="vm-migration-status">
          <ChartPngDownloadButton />
        </article>
      </ReportChartExportProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /download chart as png/i }),
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(exportPngChart).toHaveBeenCalledTimes(1);
    const [element, filename] = exportPngChart.mock.calls[0] as [
      HTMLElement,
      string,
    ];
    expect(element.getAttribute(CHART_EXPORT_ATTR)).toBe("vm-migration-status");
    expect(filename).toBe("vm-migration-status");
  });

  it("disables the button while a zip export is running", () => {
    render(
      <ReportChartExportProvider
        exportPngChart={exportPngChart}
        isExporting={true}
      >
        <article data-chart-export="hosts">
          <ChartPngDownloadButton />
        </article>
      </ReportChartExportProvider>,
    );

    expect(
      screen.getByRole("button", { name: /download chart as png/i }),
    ).toBeDisabled();
  });
});

describe("ChartCardHeaderActions", () => {
  it("still renders children when PNG export is unavailable", () => {
    render(
      <ChartCardHeaderActions>
        <span>View mode</span>
      </ChartCardHeaderActions>,
    );

    expect(screen.getByText("View mode")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /download chart as png/i }),
    ).not.toBeInTheDocument();
  });
});

describe("ChartExportCard", () => {
  it("wraps a shared card so the overlay download targets it", async () => {
    const exportPngChart = vi.fn().mockResolvedValue(undefined);
    render(
      <ReportChartExportProvider
        exportPngChart={exportPngChart}
        isExporting={false}
      >
        <ChartExportCard filename="host-power-states">
          <article>Host power</article>
        </ChartExportCard>
      </ReportChartExportProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /download chart as png/i }),
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(exportPngChart).toHaveBeenCalledTimes(1);
    const [element, filename] = exportPngChart.mock.calls[0] as [
      HTMLElement,
      string,
    ];
    expect(element.getAttribute(CHART_EXPORT_ATTR)).toBe("host-power-states");
    expect(filename).toBe("host-power-states");
  });

  it("hides the overlay in export mode", () => {
    render(
      <ChartExportCard filename="infrastructure-summary" showDownload={false}>
        <article>Summary</article>
      </ChartExportCard>,
    );

    expect(
      screen.queryByRole("button", { name: /download chart as png/i }),
    ).not.toBeInTheDocument();
  });
});
