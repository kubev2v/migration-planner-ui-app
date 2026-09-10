import { describe, expect, it } from "vitest";

import {
  buildPdfExportSegments,
  PDF_EXPORT_BLOCK_ORDER,
  splitSegmentForPageHeight,
} from "../PdfExportService";

describe("buildPdfExportSegments", () => {
  it("returns one segment per present block in dashboard order", () => {
    const segments = buildPdfExportSegments(
      {
        "1": { top: 10, bottom: 100 },
        "1b": { top: 110, bottom: 250 },
        "1c": { top: 260, bottom: 400 },
        "2": { top: 410, bottom: 500 },
        "3": { top: 510, bottom: 600 },
        "4": { top: 610, bottom: 700 },
        "4a": { top: 710, bottom: 800 },
        "5": { top: 810, bottom: 900 },
      },
      1000,
      8,
    );

    expect(segments).toHaveLength(PDF_EXPORT_BLOCK_ORDER.length);
    expect(segments?.[0]).toEqual({ top: 2, height: 106 });
    expect(segments?.[1]).toEqual({ top: 102, height: 156 });
    expect(segments?.[2]).toEqual({ top: 252, height: 156 });
    expect(segments?.[7]).toEqual({ top: 802, height: 198 });
  });

  it("skips optional blocks that are missing", () => {
    const segments = buildPdfExportSegments(
      {
        "1": { top: 0, bottom: 50 },
        "2": { top: 60, bottom: 120 },
        "3": { top: 130, bottom: 200 },
        "4": { top: 210, bottom: 280 },
        "5": { top: 290, bottom: 350 },
      },
      400,
      0,
    );

    expect(segments).toHaveLength(5);
    expect(segments?.map((segment) => segment.top)).toEqual([
      0, 60, 130, 210, 290,
    ]);
  });

  it("returns null when fewer than three blocks are present", () => {
    expect(
      buildPdfExportSegments(
        {
          "1": { top: 0, bottom: 50 },
          "2": { top: 60, bottom: 100 },
        },
        200,
        0,
      ),
    ).toBeNull();
  });
});

describe("splitSegmentForPageHeight", () => {
  it("keeps a short segment on a single page", () => {
    expect(
      splitSegmentForPageHeight({ top: 40, height: 80 }, 500, 200),
    ).toEqual([{ top: 40, height: 80 }]);
  });

  it("splits a tall cluster-details block across pages", () => {
    expect(
      splitSegmentForPageHeight({ top: 100, height: 450 }, 800, 200),
    ).toEqual([
      { top: 100, height: 200 },
      { top: 300, height: 200 },
      { top: 500, height: 50 },
    ]);
  });
});
