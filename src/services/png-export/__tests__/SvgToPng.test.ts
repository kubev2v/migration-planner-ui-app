import { describe, expect, it, vi } from "vitest";

import {
  EXPORT_GRAPH_TITLE_ATTR,
  findExportSvgs,
  getSvgExportBox,
  readChartTitle,
  readExportGraphTitle,
} from "../SvgToPng";

describe("SvgToPng", () => {
  it("keeps only SVGs large enough to be a chart", () => {
    const root = document.createElement("div");
    const legendIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    const donut = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const legend = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    vi.spyOn(legendIcon, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 10, 10),
    );
    vi.spyOn(donut, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 420, 300),
    );
    vi.spyOn(legend, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 680, 200),
    );
    const donutPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    vi.spyOn(donutPath, "getBoundingClientRect").mockReturnValue(
      new DOMRect(10, 10, 400, 280),
    );
    donut.append(donutPath);
    const legendText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    vi.spyOn(legendText, "getBoundingClientRect").mockReturnValue(
      new DOMRect(20, 160, 200, 16),
    );
    legend.append(legendText);
    root.append(legendIcon, donut, legend);

    expect(findExportSvgs(root)).toEqual([donut, legend]);
  });

  it("reads the graph-only frame title", () => {
    const root = document.createElement("div");
    const title = document.createElement("div");
    title.setAttribute(EXPORT_GRAPH_TITLE_ATTR, "");
    title.textContent = "  Host distribution by model  ";
    root.append(title);

    expect(readExportGraphTitle(root)).toBe("Host distribution by model");
  });

  it("crops to painted graphics instead of the empty svg viewport", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 800 200");
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 800, 200),
    );

    const background = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    vi.spyOn(background, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 800, 200),
    );

    const swatch = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    vi.spyOn(swatch, "getBoundingClientRect").mockReturnValue(
      new DOMRect(40, 152, 10, 10),
    );

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    vi.spyOn(label, "getBoundingClientRect").mockReturnValue(
      new DOMRect(56, 148, 180, 18),
    );

    svg.append(background, swatch, label);

    const box = getSvgExportBox(svg);
    expect(box.pixelHeight).toBeLessThan(40);
    expect(box.pixelWidth).toBeGreaterThan(190);
    expect(box.pixelWidth).toBeLessThan(220);
  });

  it("reads a live card title without download chrome", () => {
    const card = document.createElement("article");
    const title = document.createElement("div");
    title.className = "pf-v6-c-card__title";
    title.append("CPU & memory");
    const download = document.createElement("button");
    download.setAttribute("data-chart-download", "");
    download.textContent = "Download";
    title.append(download);
    card.append(title);

    expect(readChartTitle(card)).toBe("CPU & memory");
  });
});
