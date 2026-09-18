import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HtmlExportService } from "../../../services/html-export/HtmlExportService";
import type { PdfExportService } from "../../../services/pdf-export/PdfExportService";
import type { PngExportService } from "../../../services/png-export/PngExportService";
import { ReportStore } from "../ReportStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createMockPdfService = (): PdfExportService =>
  ({
    generate: vi.fn().mockResolvedValue(undefined),
  }) as unknown as PdfExportService;

const createMockHtmlService = (): HtmlExportService =>
  ({
    generate: vi.fn().mockResolvedValue(undefined),
  }) as unknown as HtmlExportService;

const createMockPngService = (): PngExportService =>
  ({
    downloadChart: vi.fn().mockResolvedValue(undefined),
    createArchive: vi.fn(),
    downloadArchive: vi.fn().mockResolvedValue(undefined),
  }) as unknown as PngExportService;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReportStore", () => {
  let pdfService: PdfExportService;
  let htmlService: HtmlExportService;
  let pngService: PngExportService;
  let store: ReportStore;

  beforeEach(() => {
    pdfService = createMockPdfService();
    htmlService = createMockHtmlService();
    pngService = createMockPngService();
    store = new ReportStore(pdfService, htmlService, pngService);
  });

  it("initial snapshot is idle with no error", () => {
    expect(store.getSnapshot()).toEqual({
      loadingState: "idle",
      error: null,
    });
  });

  // -- exportPdf ------------------------------------------------------------

  describe("exportPdf()", () => {
    const mockContainer = document.createElement("div");

    it("delegates to PdfExportService and transitions idle -> generating-pdf -> idle", async () => {
      const listener = vi.fn();
      store.subscribe(listener);

      const options = { documentTitle: "Test" };

      await store.exportPdf(mockContainer, options);

      expect(pdfService.generate).toHaveBeenCalledWith(mockContainer, options);
      expect(store.getSnapshot()).toEqual({
        loadingState: "idle",
        error: null,
      });
      // notify() called at least twice: once for generating-pdf, once for idle
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("sets error state when PdfExportService throws Error", async () => {
      vi.mocked(pdfService.generate).mockRejectedValue(new Error("PDF failed"));

      await store.exportPdf(mockContainer);

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "PDF failed",
          type: "pdf",
        },
      });
    });

    it("sets generic error when PdfExportService throws non-Error", async () => {
      vi.mocked(pdfService.generate).mockRejectedValue("string error");

      await store.exportPdf(mockContainer);

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "Failed to generate PDF",
          type: "pdf",
        },
      });
    });
  });

  // -- exportHtml -----------------------------------------------------------

  describe("exportHtml()", () => {
    const mockInventory = {
      infra: { totalHosts: 1, datastores: [], networks: [] },
      vms: {
        total: 5,
        powerStates: {},
        cpuCores: { total: 10 },
        ramGB: { total: 32 },
        diskGB: { total: 500 },
        migrationWarnings: [],
      },
    };

    it("delegates to HtmlExportService and transitions idle -> generating-html -> idle", async () => {
      const listener = vi.fn();
      store.subscribe(listener);

      const options = { documentTitle: "HTML Report" };

      await store.exportHtml(mockInventory, options);

      expect(htmlService.generate).toHaveBeenCalledWith(mockInventory, options);
      expect(store.getSnapshot()).toEqual({
        loadingState: "idle",
        error: null,
      });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("sets error state when HtmlExportService throws Error", async () => {
      vi.mocked(htmlService.generate).mockRejectedValue(
        new Error("HTML failed"),
      );

      await store.exportHtml(mockInventory);

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "HTML failed",
          type: "html",
        },
      });
    });

    it("sets generic error when HtmlExportService throws non-Error", async () => {
      vi.mocked(htmlService.generate).mockRejectedValue(null);

      await store.exportHtml(mockInventory);

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "Failed to generate HTML file",
          type: "html",
        },
      });
    });
  });

  // -- exportPng ------------------------------------------------------------

  describe("exportPng()", () => {
    const mockCard = document.createElement("article");

    it("delegates to PngExportService without toggling global loading", async () => {
      const listener = vi.fn();
      store.subscribe(listener);

      await store.exportPng(mockCard, "vm-migration-status");

      expect(pngService.downloadChart).toHaveBeenCalledWith(
        mockCard,
        "vm-migration-status",
      );
      expect(store.getSnapshot()).toEqual({
        loadingState: "idle",
        error: null,
      });
      expect(listener).not.toHaveBeenCalled();
    });

    it("sets error state when PngExportService throws Error", async () => {
      vi.mocked(pngService.downloadChart).mockRejectedValue(
        new Error("PNG failed"),
      );

      await store.exportPng(mockCard, "chart");

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "PNG failed",
          type: "png",
        },
      });
    });
  });

  describe("exportPngZip()", () => {
    const mockCard = document.createElement("article");

    it("runs sequential addChart then downloads the archive", async () => {
      const addChart = vi.fn().mockResolvedValue(undefined);
      const dispose = vi.fn();
      const archive = { addChart, isEmpty: () => false, zip: {}, dispose };
      vi.mocked(pngService.createArchive).mockReturnValue(archive as never);

      const listener = vi.fn();
      store.subscribe(listener);

      const options = { documentTitle: "Test" };

      await store.exportPngZip(async (session) => {
        await session.addChart(mockCard, "vm-migration-status");
      }, options);

      expect(addChart).toHaveBeenCalledWith(mockCard, "vm-migration-status");
      expect(pngService.downloadArchive).toHaveBeenCalledWith(archive, options);
      expect(store.getSnapshot()).toEqual({
        loadingState: "idle",
        error: null,
      });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("sets error state when downloadArchive throws Error", async () => {
      vi.mocked(pngService.createArchive).mockReturnValue({
        addChart: vi.fn(),
        isEmpty: () => true,
        zip: {},
        dispose: vi.fn(),
      } as never);
      vi.mocked(pngService.downloadArchive).mockRejectedValue(
        new Error("ZIP failed"),
      );

      await store.exportPngZip(() => Promise.resolve());

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "ZIP failed",
          type: "png",
        },
      });
    });

    it("sets generic error when downloadArchive throws non-Error", async () => {
      vi.mocked(pngService.createArchive).mockReturnValue({
        addChart: vi.fn(),
        isEmpty: () => true,
        zip: {},
        dispose: vi.fn(),
      } as never);
      vi.mocked(pngService.downloadArchive).mockRejectedValue("string error");

      await store.exportPngZip(() => Promise.resolve());

      expect(store.getSnapshot()).toEqual({
        loadingState: "error",
        error: {
          message: "Failed to download chart PNGs",
          type: "png",
        },
      });
    });
  });

  // -- clearError -----------------------------------------------------------

  describe("clearError()", () => {
    it("resets state to idle and notifies subscribers", async () => {
      // First put store into error state
      vi.mocked(pdfService.generate).mockRejectedValue(new Error("PDF failed"));
      await store.exportPdf(document.createElement("div"));

      expect(store.getSnapshot().loadingState).toBe("error");

      const listener = vi.fn();
      store.subscribe(listener);

      store.clearError();

      expect(store.getSnapshot()).toEqual({
        loadingState: "idle",
        error: null,
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  // -- subscribe / unsubscribe ---------------------------------------------

  it("unsubscribe removes listener", () => {
    const listener = vi.fn();
    const unsub = store.subscribe(listener);

    unsub();
    store.clearError(); // triggers notify

    expect(listener).not.toHaveBeenCalled();
  });
});
