/**
 * Main service for exporting reports in various formats
 */

import {
  HtmlGenerator,
  htmlGenerator as defaultHtmlGenerator,
  type HtmlGeneratorOptions,
} from './HtmlGenerator';
import {
  PdfGenerator,
  pdfGenerator as defaultPdfGenerator,
  type PdfGeneratorOptions,
} from './PdfGenerator';
import type { ExportError, InventoryData, SnapshotLike } from './types';

export interface ReportExportResult {
  success: boolean;
  error?: ExportError;
}

export interface ReportExportServiceDeps {
  pdfGenerator: PdfGenerator;
  htmlGenerator: HtmlGenerator;
}

export class ReportExportService {
  private pdfGenerator: PdfGenerator;
  private htmlGenerator: HtmlGenerator;

  constructor(deps?: Partial<ReportExportServiceDeps>) {
    this.pdfGenerator = deps?.pdfGenerator ?? defaultPdfGenerator;
    this.htmlGenerator = deps?.htmlGenerator ?? defaultHtmlGenerator;
  }

  /**
   * Export report as PDF
   */
  async exportPdf(
    componentToRender: React.ReactNode,
    options?: PdfGeneratorOptions,
  ): Promise<ReportExportResult> {
    try {
      await this.pdfGenerator.generate(componentToRender, options);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to generate PDF',
          type: 'pdf',
        },
      };
    }
  }

  /**
   * Export report as HTML
   */
  async exportHtml(
    inventory: InventoryData | SnapshotLike,
    options?: HtmlGeneratorOptions,
  ): Promise<ReportExportResult> {
    try {
      await this.htmlGenerator.generate(inventory, options);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to generate HTML file',
          type: 'html',
        },
      };
    }
  }
}

// Export singleton instance with default dependencies
export const reportExportService = new ReportExportService();
