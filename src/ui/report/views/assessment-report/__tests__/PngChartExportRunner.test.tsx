import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PngZipSession } from "../../../../../data/stores/interfaces/IReportStore";
import {
  PNG_EXPORT_ROOT_ATTR,
  PngChartExportRunner,
  type PngChartExportRunnerHandle,
} from "../PngChartExportRunner";

describe("PngChartExportRunner", () => {
  it("paints every chart once, then captures them in sequence", async () => {
    const addChart = vi.fn().mockResolvedValue(undefined);
    const labels: string[] = [];
    addChart.mockImplementation((element: HTMLElement) => {
      labels.push(element.getAttribute(PNG_EXPORT_ROOT_ATTR) ?? "");
      const host = document.getElementById("png-hidden-container");
      expect(host?.querySelectorAll(`[${PNG_EXPORT_ROOT_ATTR}]`)).toHaveLength(
        2,
      );
      expect(element.textContent).toContain(
        element.getAttribute(PNG_EXPORT_ROOT_ATTR),
      );
      return Promise.resolve();
    });

    let zipRun: Promise<void> = Promise.resolve();
    const exportPngZip = (
      run: (session: PngZipSession) => Promise<void>,
    ): void => {
      zipRun = run({ addChart });
    };

    const yieldToBrowser = vi.fn(() => Promise.resolve());
    const ref = createRef<PngChartExportRunnerHandle>();
    render(
      <PngChartExportRunner
        ref={ref}
        enabled
        exportPngZip={exportPngZip}
        yieldToBrowser={yieldToBrowser}
      />,
    );

    await act(async () => {
      ref.current?.run([
        { filename: "first", render: () => <div>first</div> },
        { filename: "second", render: () => <div>second</div> },
      ]);
      await zipRun;
    });

    expect(addChart).toHaveBeenCalledTimes(2);
    expect(labels).toEqual(["first", "second"]);
    expect(yieldToBrowser).toHaveBeenCalledTimes(1);
    expect(
      document
        .getElementById("png-hidden-container")
        ?.querySelectorAll(`[${PNG_EXPORT_ROOT_ATTR}]`),
    ).toHaveLength(0);
  });
});
