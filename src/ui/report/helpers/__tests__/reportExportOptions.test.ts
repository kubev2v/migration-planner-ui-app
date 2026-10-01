import { describe, expect, it, vi } from "vitest";

import { buildReportExportOptions } from "../reportExportOptions";

describe("buildReportExportOptions", () => {
  it("adds PDF, HTML, and PNG actions", () => {
    const onExportPdf = vi.fn();
    const onExportPng = vi.fn();
    const onExportHtml = vi.fn();

    expect(
      buildReportExportOptions({
        onExportPdf,
        onExportPng,
        onExportHtml,
      }).map((option) => option.key),
    ).toEqual(["pdf", "html", "png"]);
  });

  it("omits HTML when no handler is provided", () => {
    expect(
      buildReportExportOptions({
        onExportPdf: vi.fn(),
        onExportPng: vi.fn(),
      }).map((option) => option.key),
    ).toEqual(["pdf", "png"]);
  });
});
