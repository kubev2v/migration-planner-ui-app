/**
 * Snapshots charts to PNG.
 *
 * Donut/bar charts use native SVG rasterization. HTML-only views
 * (tables, issue bars) still clone with modern-screenshot.
 */

import JSZip from "jszip";
import {
  type Context,
  createContext,
  destroyContext,
  domToBlob,
  type Options,
} from "modern-screenshot";

import { findExportSvgs, readChartTitle, svgsToPngBlob } from "./SvgToPng";

export const CHART_EXPORT_ATTR = "data-chart-export";
export const CHART_DOWNLOAD_ATTR = "data-chart-download";
export const CHART_EXPORT_EXCLUDE_ATTR = "data-chart-export-exclude";

const SINGLE_PNG_SCALE = 2;
const ZIP_PNG_SCALE = 1.5;
const ZIP_SVG_SCALE = 2;
const DEFAULT_BACKGROUND = "#ffffff";

const FAST_CAPTURE_OPTIONS: Options = {
  drawImageInterval: 0,
  timeout: 8_000,
  features: {
    copyScrollbar: false,
    fixSvgXmlDecode: false,
  },
};

export interface PngZipExportOptions {
  documentTitle?: string;
}

export interface PngZipArchive {
  addChart(element: HTMLElement, filename: string): Promise<void>;
  isEmpty(): boolean;
  dispose(): void;
  zip: JSZip;
}

export class PngExportService {
  /**
   * Capture a chart as a PNG blob (retina scale, theme background).
   * SVG charts skip the HTML clone path.
   */
  async capture(element: HTMLElement): Promise<Blob> {
    return this.captureChart(element, SINGLE_PNG_SCALE, () =>
      this.captureNode(element, SINGLE_PNG_SCALE),
    );
  }

  /**
   * Snapshot one chart card and trigger a PNG download.
   */
  async downloadChart(element: HTMLElement, filename: string): Promise<void> {
    const blob = await this.capture(element);
    await this.triggerDownload(blob, `${this.sanitizeFilename(filename)}.png`);
  }

  /**
   * Create a ZIP archive. SVG charts skip the HTML clone path.
   */
  createArchive(): PngZipArchive {
    const zip = new JSZip();
    const usedNames = new Set<string>();
    let context: Context<HTMLElement> | null = null;

    const dispose = (): void => {
      if (!context) {
        return;
      }
      destroyContext(context);
      context = null;
    };

    const captureHtml = async (element: HTMLElement): Promise<Blob> => {
      const scale = ZIP_PNG_SCALE;
      if (!context) {
        context = await createContext(element, {
          ...this.captureOptions(element, scale),
          autoDestruct: false,
        });
      } else {
        this.retargetContext(context, element, scale);
      }

      const blob = await domToBlob(context);
      if (!blob || blob.size === 0) {
        throw new Error("Failed to capture chart as PNG");
      }
      return blob;
    };

    return {
      zip,
      isEmpty: (): boolean => usedNames.size === 0,
      dispose,
      addChart: async (
        element: HTMLElement,
        filename: string,
      ): Promise<void> => {
        const blob = await this.captureChart(element, ZIP_SVG_SCALE, () =>
          captureHtml(element),
        );
        zip.file(this.uniquePngName(filename, usedNames), blob);
      },
    };
  }

  async downloadArchive(
    archive: PngZipArchive,
    options: PngZipExportOptions = {},
  ): Promise<void> {
    try {
      if (archive.isEmpty()) {
        throw new Error("No charts available to export");
      }

      const zipBlob = await archive.zip.generateAsync({
        type: "blob",
        compression: "STORE",
      });
      const zipBase = options.documentTitle
        ? `${this.sanitizeFilename(options.documentTitle)}-charts`
        : "assessment-report-charts";
      await this.triggerDownload(zipBlob, `${zipBase}.zip`);
    } finally {
      archive.dispose();
    }
  }

  private async captureChart(
    element: HTMLElement,
    svgScale: number,
    htmlCapture: () => Promise<Blob>,
  ): Promise<Blob> {
    const svgs = findExportSvgs(element);
    if (svgs.length === 0) {
      return htmlCapture();
    }

    try {
      return await svgsToPngBlob(
        svgs,
        svgScale,
        window.getComputedStyle(element).backgroundColor || DEFAULT_BACKGROUND,
        readChartTitle(element),
      );
    } catch {
      return htmlCapture();
    }
  }

  private async captureNode(
    element: HTMLElement,
    scale: number,
  ): Promise<Blob> {
    const blob = await domToBlob(element, this.captureOptions(element, scale));

    if (!blob || blob.size === 0) {
      throw new Error("Failed to capture chart as PNG");
    }

    return blob;
  }

  private captureOptions(element: HTMLElement, scale: number): Options {
    const backgroundColor =
      window.getComputedStyle(element).backgroundColor || DEFAULT_BACKGROUND;

    return {
      ...FAST_CAPTURE_OPTIONS,
      scale,
      backgroundColor,
      filter: (node) => this.shouldIncludeNode(node),
    };
  }

  private retargetContext(
    context: Context<HTMLElement>,
    element: HTMLElement,
    scale: number,
  ): void {
    const box = element.getBoundingClientRect();
    context.node = element;
    context.scale = scale;
    context.dpi = scale === 1 ? null : 96 * scale;
    context.backgroundColor =
      window.getComputedStyle(element).backgroundColor || DEFAULT_BACKGROUND;
    context.width = box.width || element.offsetWidth;
    context.height = box.height || element.offsetHeight;
    context.svgStyles.clear();
    context.tasks = [];
    if (context.svgStyleElement) {
      context.svgStyleElement.replaceChildren();
    }
  }

  private shouldIncludeNode(node: Node): boolean {
    if (!(node instanceof Element)) {
      return true;
    }

    return (
      !node.closest(`[${CHART_DOWNLOAD_ATTR}]`) &&
      !node.closest(`[${CHART_EXPORT_EXCLUDE_ATTR}]`)
    );
  }

  private sanitizeFilename(name: string): string {
    const withoutControls = Array.from(name)
      .filter((char) => char.charCodeAt(0) >= 32)
      .join("");
    const cleaned = withoutControls
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return cleaned || "chart";
  }

  private uniquePngName(rawName: string, used: Set<string>): string {
    const base = this.sanitizeFilename(rawName);
    let candidate = `${base}.png`;
    let suffix = 2;

    while (used.has(candidate)) {
      candidate = `${base}-${suffix}.png`;
      suffix += 1;
    }

    used.add(candidate);
    return candidate;
  }

  private triggerDownload(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        link.remove();
        resolve();
      }, 250);
    });
  }
}
