import { ExternalStoreBase } from "../../lib/mvvm/ExternalStore";
import type { HtmlExportService } from "../../services/html-export/HtmlExportService";
import type {
  InventoryData,
  SnapshotLike,
} from "../../services/html-export/types";
import type {
  PdfExportService,
  PdfExtraPage,
} from "../../services/pdf-export/PdfExportService";
import type { PngExportService } from "../../services/png-export/PngExportService";
import type {
  IReportStore,
  PngZipSession,
  ReportStoreState,
} from "./interfaces/IReportStore";

const IDLE_STATE: ReportStoreState = Object.freeze({
  loadingState: "idle" as const,
  error: null,
});

export class ReportStore
  extends ExternalStoreBase<ReportStoreState>
  implements IReportStore
{
  private state: ReportStoreState = IDLE_STATE;
  private pdfExportService: PdfExportService;
  private htmlExportService: HtmlExportService;
  private pngExportService: PngExportService;

  constructor(
    pdfExportService: PdfExportService,
    htmlExportService: HtmlExportService,
    pngExportService: PngExportService,
  ) {
    super();
    this.pdfExportService = pdfExportService;
    this.htmlExportService = htmlExportService;
    this.pngExportService = pngExportService;
  }

  override getSnapshot(): ReportStoreState {
    return this.state;
  }

  async exportPdf(
    container: HTMLElement,
    options?: {
      documentTitle?: string;
      additionalTocItems?: string[];
      extraPages?: PdfExtraPage[];
    },
  ): Promise<void> {
    this.setState({ loadingState: "generating-pdf", error: null });

    try {
      await this.pdfExportService.generate(container, options);
      this.setState(IDLE_STATE);
    } catch (error) {
      this.setState({
        loadingState: "error",
        error: {
          message:
            error instanceof Error ? error.message : "Failed to generate PDF",
          type: "pdf",
        },
      });
    }
  }

  async exportHtml(
    inventory: unknown,
    options?: { documentTitle?: string },
  ): Promise<void> {
    this.setState({ loadingState: "generating-html", error: null });

    try {
      await this.htmlExportService.generate(
        inventory as InventoryData | SnapshotLike,
        options,
      );
      this.setState(IDLE_STATE);
    } catch (error) {
      this.setState({
        loadingState: "error",
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate HTML file",
          type: "html",
        },
      });
    }
  }

  /**
   * Snapshot a single on-screen chart card. Does not toggle the global
   * export loading flag so the per-card button can show its own spinner.
   */
  async exportPng(element: HTMLElement, filename: string): Promise<void> {
    try {
      await this.pngExportService.downloadChart(element, filename);
    } catch (error) {
      this.setState({
        loadingState: "error",
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to download chart PNG",
          type: "png",
        },
      });
    }
  }

  async exportPngZip(
    run: (session: PngZipSession) => Promise<void>,
    options?: { documentTitle?: string },
  ): Promise<void> {
    this.setState({ loadingState: "generating-png", error: null });
    const archive = this.pngExportService.createArchive();

    try {
      await run({
        addChart: (element, filename) => archive.addChart(element, filename),
      });
      await this.pngExportService.downloadArchive(archive, options);
      this.setState(IDLE_STATE);
    } catch (error) {
      archive.dispose();
      this.setState({
        loadingState: "error",
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to download chart PNGs",
          type: "png",
        },
      });
    }
  }

  clearError(): void {
    this.setState(IDLE_STATE);
  }

  private setState(newState: ReportStoreState): void {
    this.state = newState;
    this.notify();
  }
}
