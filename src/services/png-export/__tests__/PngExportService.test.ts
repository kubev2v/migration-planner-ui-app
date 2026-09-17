import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHART_DOWNLOAD_ATTR,
  CHART_EXPORT_EXCLUDE_ATTR,
  PngExportService,
} from "../PngExportService";

const {
  mockDomToBlob,
  mockCreateContext,
  mockDestroyContext,
  mockZipFile,
  mockGenerateAsync,
  mockFindExportSvgs,
  mockSvgsToPngBlob,
  mockReadChartTitle,
} = vi.hoisted(() => ({
  mockDomToBlob: vi.fn(),
  mockCreateContext: vi.fn(),
  mockDestroyContext: vi.fn(),
  mockZipFile: vi.fn(),
  mockGenerateAsync: vi.fn(),
  mockFindExportSvgs: vi.fn(),
  mockSvgsToPngBlob: vi.fn(),
  mockReadChartTitle: vi.fn(),
}));

vi.mock("modern-screenshot", () => ({
  domToBlob: mockDomToBlob,
  createContext: mockCreateContext,
  destroyContext: mockDestroyContext,
}));

vi.mock("jszip", () => ({
  default: class MockJSZip {
    file = mockZipFile;
    generateAsync = mockGenerateAsync;
  },
}));

vi.mock("../SvgToPng", () => ({
  findExportSvgs: mockFindExportSvgs,
  svgsToPngBlob: mockSvgsToPngBlob,
  readChartTitle: mockReadChartTitle,
}));

describe("PngExportService", () => {
  let service: PngExportService;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new PngExportService();
    mockDomToBlob.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    mockFindExportSvgs.mockReturnValue([]);
    mockReadChartTitle.mockReturnValue(undefined);
    mockSvgsToPngBlob.mockResolvedValue(
      new Blob(["svg-png"], { type: "image/png" }),
    );
    mockCreateContext.mockImplementation((node: HTMLElement) =>
      Promise.resolve({
        __CONTEXT__: true,
        node,
        width: 100,
        height: 100,
        scale: 1.5,
        svgStyles: new Map(),
        tasks: [],
        svgStyleElement: document.createElement("style"),
      }),
    );
    mockGenerateAsync.mockResolvedValue(
      new Blob(["zip"], { type: "application/zip" }),
    );
    mockZipFile.mockReset();

    createObjectURL = vi.fn(() => "blob:mock");
    revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.stubGlobal(
      "getComputedStyle",
      () => ({ backgroundColor: "rgb(255, 255, 255)" }) as CSSStyleDeclaration,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const stubAnchorClick = (): void => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined,
    );
  };

  it("downloadChart captures the node and downloads a png", async () => {
    stubAnchorClick();
    const card = document.createElement("article");

    const pending = service.downloadChart(card, "VM Migration Status");
    await vi.runAllTimersAsync();
    await pending;

    expect(mockDomToBlob).toHaveBeenCalledWith(
      card,
      expect.objectContaining({
        scale: 2,
        backgroundColor: "rgb(255, 255, 255)",
        drawImageInterval: 0,
      }),
    );
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("filters download controls and excluded chrome from the clone", async () => {
    const card = document.createElement("article");
    await service.capture(card);

    const options = mockDomToBlob.mock.calls[0]?.[1] as {
      filter: (node: Node) => boolean;
    };

    const downloadBtn = document.createElement("button");
    downloadBtn.setAttribute(CHART_DOWNLOAD_ATTR, "");
    const excluded = document.createElement("div");
    excluded.setAttribute(CHART_EXPORT_EXCLUDE_ATTR, "");
    const keep = document.createElement("span");

    expect(options.filter(downloadBtn)).toBe(false);
    expect(options.filter(excluded)).toBe(false);
    expect(options.filter(keep)).toBe(true);
    expect(options.filter(document.createTextNode("x"))).toBe(true);
  });

  it("reuses one screenshot context for zip captures, then downloads once", async () => {
    stubAnchorClick();
    const first = document.createElement("article");
    const second = document.createElement("article");
    const archive = service.createArchive();

    await archive.addChart(first, "vm-migration-status");
    await archive.addChart(second, "operating-systems");

    const pending = service.downloadArchive(archive, {
      documentTitle: "Prototype assessment report",
    });
    await vi.runAllTimersAsync();
    await pending;

    expect(mockCreateContext).toHaveBeenCalledTimes(1);
    expect(mockDomToBlob).toHaveBeenCalledTimes(2);
    expect(mockDomToBlob.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ node: second }),
    );
    expect(mockZipFile).toHaveBeenCalledTimes(2);
    expect(mockZipFile).toHaveBeenCalledWith(
      "vm-migration-status.png",
      expect.any(Blob),
    );
    expect(mockZipFile).toHaveBeenCalledWith(
      "operating-systems.png",
      expect.any(Blob),
    );
    expect(mockGenerateAsync).toHaveBeenCalledWith({
      type: "blob",
      compression: "STORE",
    });
    expect(mockDestroyContext).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it("rasterizes SVG charts in the zip path without cloning HTML", async () => {
    const root = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mockFindExportSvgs.mockReturnValue([svg]);
    mockReadChartTitle.mockReturnValue("Host distribution by model");

    const archive = service.createArchive();
    await archive.addChart(root, "hosts");

    expect(mockSvgsToPngBlob).toHaveBeenCalledWith(
      [svg],
      2,
      "rgb(255, 255, 255)",
      "Host distribution by model",
    );
    expect(mockCreateContext).not.toHaveBeenCalled();
    expect(mockDomToBlob).not.toHaveBeenCalled();
    expect(mockZipFile).toHaveBeenCalledWith("hosts.png", expect.any(Blob));
  });

  it("rasterizes SVG charts for a single-card download", async () => {
    stubAnchorClick();
    const card = document.createElement("article");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mockFindExportSvgs.mockReturnValue([svg]);
    mockReadChartTitle.mockReturnValue("CPU & memory");

    const pending = service.downloadChart(card, "cpu-and-memory");
    await vi.runAllTimersAsync();
    await pending;

    expect(mockSvgsToPngBlob).toHaveBeenCalledWith(
      [svg],
      2,
      "rgb(255, 255, 255)",
      "CPU & memory",
    );
    expect(mockDomToBlob).not.toHaveBeenCalled();
  });

  it("falls back to html capture when SVG rasterize fails", async () => {
    const root = document.createElement("div");
    mockFindExportSvgs.mockReturnValue([
      document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    ]);
    mockSvgsToPngBlob.mockRejectedValue(new Error("bad svg"));

    const archive = service.createArchive();
    await archive.addChart(root, "hosts");

    expect(mockCreateContext).toHaveBeenCalledTimes(1);
    expect(mockDomToBlob).toHaveBeenCalledTimes(1);
    expect(mockZipFile).toHaveBeenCalledWith("hosts.png", expect.any(Blob));
  });

  it("throws when the archive has no charts", async () => {
    await expect(
      service.downloadArchive(service.createArchive()),
    ).rejects.toThrow("No charts available to export");
  });

  it("throws when capture returns an empty blob", async () => {
    mockDomToBlob.mockResolvedValue(new Blob([]));
    await expect(
      service.downloadChart(document.createElement("div"), "chart"),
    ).rejects.toThrow("Failed to capture chart as PNG");
  });
});
