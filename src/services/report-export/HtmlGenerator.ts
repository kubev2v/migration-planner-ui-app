/**
 * Generates HTML reports from inventory data
 */

import { ChartDataTransformer } from './ChartDataTransformer';
import { EXPORT_CONFIG } from './constants';
import { HtmlTemplateBuilder } from './HtmlTemplateBuilder';
import type { InventoryData, SnapshotLike } from './types';

export interface HtmlGeneratorOptions {
  documentTitle?: string;
  filename?: string;
}

export class HtmlGenerator {
  private chartTransformer = new ChartDataTransformer();
  private templateBuilder = new HtmlTemplateBuilder();

  /**
   * Generate and download an HTML report
   */
  async generate(
    inventory: InventoryData | SnapshotLike,
    options: HtmlGeneratorOptions = {},
  ): Promise<void> {
    if (!inventory) {
      throw new Error('No inventory data available for export');
    }

    const chartData = this.chartTransformer.transform(inventory);
    const htmlContent = this.templateBuilder.build(chartData, inventory);
    const filename = options.filename || EXPORT_CONFIG.HTML_FILENAME;

    this.downloadHtml(htmlContent, filename);
  }

  /**
   * Download HTML content as a file
   */
  private downloadHtml(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }
}

// Export singleton instance
export const htmlGenerator = new HtmlGenerator();

