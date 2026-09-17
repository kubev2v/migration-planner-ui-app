import type { ExternalStore } from "../../../lib/mvvm/ExternalStore";

// Loading states for export operations
export type LoadingState =
  "idle" | "generating-pdf" | "generating-html" | "generating-png" | "error";

// Export error structure
export interface ExportError {
  message: string;
  type: "pdf" | "html" | "png" | "general";
}

export interface ReportStoreState {
  loadingState: LoadingState;
  error: ExportError | null;
}

export interface IReportStore extends ExternalStore<ReportStoreState> {
  exportPdf(
    container: HTMLElement,
    options?: {
      documentTitle?: string;
      additionalTocItems?: string[];
      extraPages?: import("../../../services/pdf-export/PdfExportService").PdfExtraPage[];
    },
  ): Promise<void>;
  exportHtml(
    inventory: unknown,
    options?: { documentTitle?: string },
  ): Promise<void>;
  exportPng(element: HTMLElement, filename: string): Promise<void>;
  /**
   * ZIP export: the View paints the hidden chart tree, then calls
   * {@link PngZipSession.addChart} once per card. The store owns loading
   * state and the archive.
   */
  exportPngZip(
    run: (session: PngZipSession) => Promise<void>,
    options?: { documentTitle?: string },
  ): Promise<void>;
  clearError(): void;
}

export interface PngZipSession {
  addChart(element: HTMLElement, filename: string): Promise<void>;
}
