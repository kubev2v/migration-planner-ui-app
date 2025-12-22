/**
 * Report Export Service
 *
 * Provides functionality to export reports in various formats (PDF, HTML).
 *
 * Usage:
 * ```typescript
 * import { reportExportService } from '@/services/report-export';
 *
 * // Export as PDF
 * await reportExportService.exportPdf(componentToRender, { documentTitle: 'My Report' });
 *
 * // Export as HTML
 * await reportExportService.exportHtml(inventoryData, { filename: 'report.html' });
 * ```
 */

// Main service
export {
  ReportExportService,
  reportExportService, type ReportExportResult, type ReportExportServiceDeps
} from './ReportExportService';

// Individual generators (for advanced use cases)
export { HtmlGenerator, htmlGenerator } from './HtmlGenerator';
export { PdfGenerator, pdfGenerator } from './PdfGenerator';

// Data transformers
export { ChartDataTransformer, chartDataTransformer } from './ChartDataTransformer';
export { HtmlTemplateBuilder, htmlTemplateBuilder } from './HtmlTemplateBuilder';

// Types
export type {
  ChartData,
  Datastore,
  ExportError,
  ExportOptions,
  HtmlExportOptions,
  InfraData,
  InventoryData,
  LoadingState,
  MigrationWarning,
  Network,
  OSInfo,
  PdfExportOptions,
  PowerStates,
  ResourceInfo,
  SnapshotLike,
  VMsData
} from './types';

// Constants
export { CHART_COLORS, EXPORT_CONFIG, TOC_ITEMS } from './constants';

