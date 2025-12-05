import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { Source } from '@migration-planner-ui/api-client/models';
import {
  Alert,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import './DownloadPDFStyles.css';
import { SnapshotLike } from '../../../pages/report/Report';

// Constants
const EXPORT_CONFIG = {
  PDF_FILENAME: 'Dashboard_Report.pdf',
  HTML_FILENAME: 'VMware_Infrastructure_Assessment_Comprehensive.html',
  CANVAS_TIMEOUT: 500,
  HIDDEN_CONTAINER_WIDTH: 1600,
  HIDDEN_CONTAINER_HEIGHT: 1200,
  PDF_MARGIN: 10,
} as const;

const CHART_COLORS = {
  PRIMARY: '#3498db',
  SUCCESS: '#27ae60',
  DANGER: '#e74c3c',
  WARNING: '#f39c12',
  INFO: '#9b59b6',
  SECONDARY: '#1abc9c',
  DARK: '#34495e',
  ORANGE: '#e67e22',
} as const;

// Enhanced TypeScript interfaces
interface OSInfo {
  count: number;
  supported: boolean;
}

interface MigrationWarning {
  label: string;
  count: number;
}

interface PowerStates {
  poweredOn?: number;
  poweredOff?: number;
  suspended?: number;
  [key: string]: number | undefined;
}

interface ResourceInfo {
  total: number;
}

interface VMsData {
  total: number;
  powerStates: PowerStates;
  cpuCores: ResourceInfo;
  ramGB: ResourceInfo;
  diskGB: ResourceInfo;
  os?: Record<string, number>;
  osInfo?: Record<string, OSInfo>;
  migrationWarnings: MigrationWarning[];
}

interface Datastore {
  vendor: string;
  type: string;
  protocolType: string;
  totalCapacityGB: number;
  freeCapacityGB: number;
  hardwareAcceleratedMove: boolean;
}

interface Network {
  name: string;
  type: string;
}

interface InfraData {
  totalHosts: number;
  datastores: Datastore[];
  networks: Network[];
}

interface ExportOption {
  key: string;
  label: string;
  description: string;
  action: () => Promise<void>;
  disabled?: boolean;
}

type LoadingState = 'idle' | 'generating-pdf' | 'generating-html' | 'error';

interface ExportError {
  message: string;
  type: 'pdf' | 'html' | 'general';
}

interface ChartData {
  powerStateData: Array<[string, number]>;
  resourceData: Array<[string, number, number]>;
  osData: Array<[string, number]>;
  warningsData: Array<[string, number]>;
  storageLabels: string[];
  storageUsedData: number[];
  storageTotalData: number[];
}

interface InventoryData {
  infra: InfraData;
  vms: VMsData;
}

interface EnhancedDownloadButtonProps {
  elementId: string;
  componentToRender: React.ReactNode;
  sourceData?: Source;
  snapshot?: SnapshotLike;
  documentTitle?: string;
}

const EnhancedDownloadButton: React.FC<EnhancedDownloadButtonProps> = ({
  elementId: _elementId,
  componentToRender,
  sourceData,
  snapshot,
  documentTitle,
}): JSX.Element => {
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<ExportError | null>(null);

  const isLoading =
    loadingState === 'generating-pdf' || loadingState === 'generating-html';
  const hasInventoryData =
    Boolean(sourceData?.inventory) || Boolean(snapshot.inventory);

  const handleDownloadPDF = async (): Promise<void> => {
    // Ensure cleanup even on errors
    let tempDiv: HTMLDivElement | null = null;
    let root: Root | null = null;
    const originalWarn = console.warn;
    try {
      setLoadingState('generating-pdf');
      setError(null);

      console.warn = (): void => {};

      const hiddenContainer = hiddenContainerRef.current;
      if (!hiddenContainer) {
        throw new Error('Hidden container not found');
      }

      hiddenContainer.innerHTML = '';

      tempDiv = document.createElement('div');
      tempDiv.id = 'hidden-container';
      hiddenContainer.appendChild(tempDiv);
      root = createRoot(tempDiv);
      root.render(componentToRender);

      await new Promise((resolve) =>
        setTimeout(resolve, EXPORT_CONFIG.CANVAS_TIMEOUT),
      );

      const style = document.createElement('style');
      style.textContent = `
        #hidden-container .dashboard-card-print, #hidden-container .pf-v6-c-card, #hidden-container [data-export-block] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-top: 80px !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        #hidden-container .dashboard-card, #hidden-container .pf-v6-c-card, #hidden-container [data-export-block] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-top: 80px !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
      `;
      hiddenContainer.appendChild(style);
      // Collect DOM block boundaries to avoid slicing charts/cards across pages
      const hiddenContainerRect =
        hiddenContainer.getBoundingClientRect() as DOMRect;
      const domBlocks = Array.from(
        hiddenContainer.querySelectorAll<HTMLElement>(
          '.dashboard-card-print, .pf-v6-c-card',
        ),
      )
        .map((el) => {
          const r = el.getBoundingClientRect();
          const top = Math.max(0, r.top - hiddenContainerRect.top);
          const bottom = Math.max(top, r.bottom - hiddenContainerRect.top);
          const height = bottom - top;
          return { top, bottom, height };
        })
        .filter((b) => b.height > 4) // ignore trivial blocks
        .sort((a, b) => a.top - b.top);

      const canvas = await html2canvas(hiddenContainer, { useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const { PDF_MARGIN: margin } = EXPORT_CONFIG;

      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Scale so the width fits the printable area.
      const scaleFactor = contentWidth / imgWidth;
      const pageHeightPx = contentHeight / scaleFactor; // height in source pixels that fits one page
      const domToCanvasScale =
        imgWidth / Math.max(1, hiddenContainer.clientWidth);
      const blocksPx = domBlocks.map((b) => ({
        top: b.top * domToCanvasScale,
        bottom: b.bottom * domToCanvasScale,
        height: b.height * domToCanvasScale,
      }));
      // Small guard to avoid bleeding of the next block's border/shadow into the current page
      const BLEED_GUARD_PX = Math.max(0, Math.round(6 * domToCanvasScale));

      // 1) Cover + TOC page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFontSize(18);
      const headerTitle =
        documentTitle && documentTitle.trim().length > 0
          ? documentTitle
          : 'VMware Infrastructure Assessment Report';
      pdf.text(headerTitle, pageWidth / 2, margin + 8, {
        align: 'center',
      });
      pdf.setFontSize(11);
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        margin + 18,
        { align: 'center' },
      );
      pdf.setFontSize(14);
      pdf.text('Table of contents', margin, margin + 32);
      pdf.setFontSize(11);
      const tocItems = [
        '- Infrastructure overview',
        '- VM migration status',
        '- Operating system distribution',
        '- Disks (VM count by disk size tier)',
        '- Disks (Total disk size by tier)',
        '- Clusters (VM distribution by cluster)',
        '- Clusters (Cluster distribution by data center)',
        '- Migration warnings',
        '- Errors',
      ];
      let tocY = margin + 42;
      tocItems.forEach((line) => {
        if (tocY > pageHeight - margin - 10) {
          pdf.addPage();
          tocY = margin;
        }
        pdf.text(line, margin, tocY);
        tocY += 7;
      });

      // Move to first content page
      pdf.addPage();

      // Try to segment by specific GridItems if present:
      // Page 2: blocks 1+2; Page 3: block 3; Page 4: block 4
      type Segment = { top: number; height: number };
      const SEGMENT_PADDING_PX = 12 * domToCanvasScale;
      const getBlockByIndex = (
        idx: number,
      ): { top: number; bottom: number } | null => {
        const el = hiddenContainer.querySelector<HTMLElement>(
          `[data-export-block="${idx}"]`,
        );
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const top =
          Math.max(0, r.top - hiddenContainerRect.top) * domToCanvasScale;
        const bottom =
          Math.max(top, r.bottom - hiddenContainerRect.top) * domToCanvasScale;
        return { top, bottom };
      };
      const b1 = getBlockByIndex(1);
      const b2 = getBlockByIndex(2);
      const b3 = getBlockByIndex(3);
      const b4 = getBlockByIndex(4);

      let customSegments: Segment[] | null = null;
      if (b1 && b2 && b3 && b4) {
        const firstTop = Math.max(
          0,
          Math.min(b1.top, b2.top) - SEGMENT_PADDING_PX,
        );
        const firstBottom = Math.min(
          imgHeight,
          Math.max(b1.bottom, b2.bottom) + SEGMENT_PADDING_PX,
        );
        customSegments = [
          {
            top: firstTop,
            height: Math.max(1, firstBottom - firstTop),
          },
          {
            top: Math.max(0, b3.top - SEGMENT_PADDING_PX),
            height: Math.max(
              1,
              Math.min(imgHeight, b3.bottom + SEGMENT_PADDING_PX) -
                Math.max(0, b3.top - SEGMENT_PADDING_PX),
            ),
          },
          {
            top: Math.max(0, b4.top - SEGMENT_PADDING_PX),
            height: Math.max(
              1,
              Math.min(imgHeight, b4.bottom + SEGMENT_PADDING_PX) -
                Math.max(0, b4.top - SEGMENT_PADDING_PX),
            ),
          },
        ];
      }

      // Compute slice heights choosing the nearest block boundary to each page target.
      // This minimizes large blanks while still avoiding cutting through blocks.
      const sliceHeights: number[] = [];
      if (blocksPx.length === 0) {
        let remaining = imgHeight;
        while (remaining > 0) {
          const h = Math.min(pageHeightPx, remaining);
          sliceHeights.push(h);
          remaining -= h;
        }
      } else {
        // Pre-compute unique block bottoms for quick lookups
        const boundaries = Array.from(
          new Set(blocksPx.map((b) => Math.round(b.bottom))),
        )
          .filter((v) => v > 0 && v <= imgHeight)
          .sort((a, b) => a - b);
        if (boundaries[boundaries.length - 1] !== imgHeight) {
          boundaries.push(imgHeight);
        }
        let y = 0;
        const MIN_ADVANCE = 32; // px in canvas space to always move forward
        const MAX_LOOP_GUARD = 2000;
        let guard = 0;
        while (y < imgHeight && guard++ < MAX_LOOP_GUARD) {
          const target = y + pageHeightPx;
          // Choose the bottom of the LAST block that STARTS before the target.
          // This guarantees we never include the start of the next block on the current page.
          const eligibleBottoms = blocksPx
            .filter(
              (b) =>
                b.top <= target - MIN_ADVANCE && b.bottom >= y + MIN_ADVANCE,
            )
            .map((b) => Math.round(b.bottom))
            .sort((a, b) => a - b);
          let cut: number;
          if (eligibleBottoms.length > 0) {
            const lastBottom = eligibleBottoms[eligibleBottoms.length - 1];
            const guarded = Math.max(
              y + MIN_ADVANCE,
              lastBottom - BLEED_GUARD_PX,
            );
            cut = Math.min(imgHeight, guarded);
          } else {
            // Fallback: cut at target (may split a very tall single block)
            cut = Math.min(
              imgHeight,
              Math.max(y + MIN_ADVANCE, Math.round(target)),
            );
          }
          const height = Math.max(1, cut - y);
          sliceHeights.push(height);
          y += height;
        }
      }

      if (customSegments && customSegments.length === 3) {
        for (let i = 0; i < customSegments.length; i++) {
          const { top, height } = customSegments[i];
          const sliceHeightPx = Math.max(1, Math.min(height, imgHeight - top));
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sliceHeightPx;
          const ctx = pageCanvas.getContext('2d');
          if (!ctx) throw new Error('Canvas 2D context unavailable');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            top,
            imgWidth,
            sliceHeightPx,
            0,
            0,
            imgWidth,
            sliceHeightPx,
          );
          const imgDataPage = pageCanvas.toDataURL('image/png');
          const pageScale = Math.min(
            contentWidth / imgWidth,
            contentHeight / sliceHeightPx,
          );
          const renderWidthMm = imgWidth * pageScale;
          const renderHeightMm = sliceHeightPx * pageScale;
          pdf.addImage(
            imgDataPage,
            'PNG',
            margin + (contentWidth - renderWidthMm) / 2,
            margin,
            renderWidthMm,
            renderHeightMm,
          );
          if (i < customSegments.length - 1) {
            pdf.addPage();
          }
        }
      } else {
        let consumedPx = 0;
        for (let pageIndex = 0; pageIndex < sliceHeights.length; pageIndex++) {
          const sliceHeightPx = sliceHeights[pageIndex];
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sliceHeightPx;
          const ctx = pageCanvas.getContext('2d');
          if (!ctx) throw new Error('Canvas 2D context unavailable');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          const sy = consumedPx;
          ctx.drawImage(
            canvas,
            0,
            sy,
            imgWidth,
            sliceHeightPx,
            0,
            0,
            imgWidth,
            sliceHeightPx,
          );
          const imgDataPage = pageCanvas.toDataURL('image/png');
          const pageScale = Math.min(
            contentWidth / imgWidth,
            contentHeight / sliceHeightPx,
          );
          const renderWidthMm = imgWidth * pageScale;
          const renderHeightMm = sliceHeightPx * pageScale;
          pdf.addImage(
            imgDataPage,
            'PNG',
            margin + (contentWidth - renderWidthMm) / 2,
            margin,
            renderWidthMm,
            renderHeightMm,
          );
          consumedPx += sliceHeightPx;
          if (consumedPx < imgHeight) {
            pdf.addPage();
          }
        }
      }

      // 3) Footer page numbering
      // Determine total pages in a TS-safe way
      // Prefer public getNumberOfPages() when available; fallback to internal pages length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyPdf = pdf as any;
      const totalPages =
        typeof anyPdf.getNumberOfPages === 'function'
          ? anyPdf.getNumberOfPages()
          : Array.isArray(anyPdf.internal?.pages)
            ? anyPdf.internal.pages.length
            : 1;
      pdf.setFontSize(9);
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
          align: 'center',
        });
      }
      const pdfFilename = documentTitle
        ? `${documentTitle.replace(/\.pdf$/i, '')}.pdf`
        : EXPORT_CONFIG.PDF_FILENAME;
      pdf.save(pdfFilename);

      setLoadingState('idle');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError({
        message:
          error instanceof Error ? error.message : 'Failed to generate PDF',
        type: 'pdf',
      });
      setLoadingState('error');
    } finally {
      try {
        root?.unmount();
        tempDiv?.parentNode?.removeChild(tempDiv);
        hiddenContainerRef.current &&
          (hiddenContainerRef.current.innerHTML = '');
      } catch (_) {
        /* noop */
      }
      console.warn = originalWarn;
    }
  };

  // Helper function to format numbers with K/M suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Helper function to escape HTML to prevent XSS attacks
  const escapeHtml = (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Helper function to extract OS data from either vms.os or vms.osInfo
  const extractOSData = (vms: VMsData): Array<[string, number]> => {
    // Check if osInfo exists (new format)
    if (vms.osInfo && Object.keys(vms.osInfo).length > 0) {
      return Object.entries(vms.osInfo).map(
        ([osName, osInfo]: [string, OSInfo]) => [osName, osInfo.count],
      );
    }
    // Fallback to os (old format)
    if (vms.os && Object.keys(vms.os).length > 0) {
      return Object.entries(vms.os);
    }
    return [];
  };

  // Generate chart data from inventory
  const generateChartData = (
    inventory: InventoryData | SnapshotLike,
  ): ChartData => {
    // Normalize SnapshotLike structure to extract infra/vms
    const snapshotLike = inventory as SnapshotLike;
    const infra = (snapshotLike.infra ||
      snapshotLike.inventory?.infra ||
      snapshotLike.inventory?.vcenter?.infra) as InfraData;
    const vms = (snapshotLike.vms ||
      snapshotLike.inventory?.vms ||
      snapshotLike.inventory?.vcenter?.vms) as VMsData;

    if (!infra || !vms) {
      throw new Error('Invalid inventory data structure');
    }
    const powerStateData = [
      ['Powered On', vms.powerStates.poweredOn || 0],
      ['Powered Off', vms.powerStates.poweredOff || 0],
      ['Suspended', vms.powerStates.suspended || 0],
    ] as Array<[string, number]>;

    const resourceData = [
      ['CPU Cores', vms.cpuCores.total, Math.round(vms.cpuCores.total * 1.2)],
      ['Memory GB', vms.ramGB.total, Math.round(vms.ramGB.total * 1.25)],
      ['Storage GB', vms.diskGB.total, Math.round(vms.diskGB.total * 1.15)],
    ] as Array<[string, number, number]>;

    const osEntries = extractOSData(vms).sort(
      ([, a], [, b]) => (b as number) - (a as number),
    );
    const osData = osEntries
      .slice(0, 8)
      .map(([name, count]) => [name, count]) as Array<[string, number]>;

    const warningsData = vms.migrationWarnings.map((w) => [
      w.label,
      w.count,
    ]) as Array<[string, number]>;

    const storageLabels = infra.datastores.map(
      (ds: Datastore) => `${ds.vendor} ${ds.type}`,
    );
    const storageUsedData = infra.datastores.map(
      (ds: Datastore) => ds.totalCapacityGB - ds.freeCapacityGB,
    );
    const storageTotalData = infra.datastores.map(
      (ds: Datastore) => ds.totalCapacityGB,
    );

    return {
      powerStateData,
      resourceData,
      osData,
      warningsData,
      storageLabels,
      storageUsedData,
      storageTotalData,
    };
  };

  // Generate HTML table for operating systems
  const generateOSTable = (vms: VMsData): string => {
    const osEntries = extractOSData(vms).sort(
      ([, a], [, b]) => (b as number) - (a as number),
    );
    if (osEntries.length === 0) {
      return '<tr><td colspan="4">No operating system data available</td></tr>';
    }

    return osEntries
      .map(([osName, count]) => {
        const percentage = (((count as number) / vms.total) * 100).toFixed(1);
        const priority = osName.includes('Windows')
          ? 'High'
          : osName.includes('Linux') || osName.includes('Red Hat')
            ? 'Medium'
            : 'Review Required';
        return `
      <tr>
        <td><strong>${escapeHtml(osName)}</strong></td>
        <td>${count}</td>
        <td>${percentage}%</td>
        <td>${escapeHtml(priority)}</td>
      </tr>`;
      })
      .join('');
  };

  // Generate HTML table for migration warnings
  const generateWarningsTable = (vms: VMsData): string => {
    if (vms.migrationWarnings.length === 0) {
      return `<div class="table-section">
      <h3>Migration Warnings Analysis</h3>
      <p>No migration warnings to display.</p>
    </div>`;
    }

    const warningsRows = vms.migrationWarnings
      .map((warning: MigrationWarning) => {
        const impact =
          warning.count > 50
            ? 'Critical'
            : warning.count > 20
              ? 'High'
              : warning.count > 5
                ? 'Medium'
                : 'Low';
        const percentage = ((warning.count / vms.total) * 100).toFixed(1);
        const priority =
          impact === 'Critical'
            ? 'Immediate'
            : impact === 'High'
              ? 'Before Migration'
              : impact === 'Medium'
                ? 'During Migration'
                : 'Post Migration';
        const rowClass =
          impact === 'Critical'
            ? 'warning-high'
            : impact === 'High'
              ? 'warning-medium'
              : impact === 'Medium'
                ? 'warning-low'
                : '';

        return `
      <tr class="${rowClass}">
        <td><strong>${escapeHtml(warning.label)}</strong></td>
        <td>${warning.count}</td>
        <td>${escapeHtml(impact)}</td>
        <td>${percentage}%</td>
        <td>${escapeHtml(priority)}</td>
      </tr>`;
      })
      .join('');

    return `<div class="table-section">
    <h3>Migration Warnings Analysis</h3>
    <table>
      <thead>
        <tr>
          <th>Warning Category</th>
          <th>Affected VMs</th>
          <th>Impact Level</th>
          <th>% of Total VMs</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${warningsRows}
      </tbody>
    </table>
  </div>`;
  };

  // Generate HTML table for storage infrastructure
  const generateStorageTable = (infra: InfraData): string => {
    if (infra.datastores.length === 0) {
      return '<tr><td colspan="7">No datastore information available</td></tr>';
    }

    return infra.datastores
      .map((ds: Datastore) => {
        const utilization =
          ds.totalCapacityGB > 0
            ? (
                ((ds.totalCapacityGB - ds.freeCapacityGB) /
                  ds.totalCapacityGB) *
                100
              ).toFixed(1)
            : '0.0';
        const hwAccel = ds.hardwareAcceleratedMove ? '✅ Yes' : '❌ No';

        return `
      <tr>
        <td><strong>${escapeHtml(ds.vendor)}</strong></td>
        <td>${escapeHtml(ds.type)}</td>
        <td>${escapeHtml(ds.protocolType)}</td>
        <td>${formatNumber(ds.totalCapacityGB)}</td>
        <td>${formatNumber(ds.freeCapacityGB)}</td>
        <td>${utilization}%</td>
        <td>${hwAccel}</td>
      </tr>`;
      })
      .join('');
  };

  // Generate CSS styles for the HTML report
  const generateHTMLStyles = (): string => {
    return `
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
    .header p { color: #7f8c8d; font-size: 1.1em; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-card { background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 600; }
    .summary-card .number { font-size: 32px; font-weight: bold; }
    .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 30px; margin: 30px 0; }
    .chart-container { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .chart-container h3 { text-align: center; color: #2c3e50; margin-bottom: 20px; font-size: 1.3em; }
    .chart-wrapper { position: relative; height: 300px; }
    .section { margin: 40px 0; }
    .section h2 { color: #2c3e50; border-left: 4px solid #3498db; padding-left: 15px; margin-bottom: 25px; }
    .table-section { margin: 30px 0; }
    .table-section h3 { color: #2c3e50; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e8f4ff; }
    .warning-high { background-color: #e74c3c !important; color: white; }
    .warning-medium { background-color: #f39c12 !important; color: white; }
    .warning-low { background-color: #27ae60 !important; color: white; }
    .summary-box { background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-box h2 { margin-top: 0; }
    .footer { text-align: center; margin-top: 40px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px; }
    .footer p { margin: 5px 0; }
    @media print { body { background: white; } .container { box-shadow: none; } .chart-container { break-inside: avoid; } }
    @media (max-width: 768px) {
        .chart-grid { grid-template-columns: 1fr; }
        .summary-grid { grid-template-columns: repeat(2, 1fr); }
        .container { padding: 20px; margin: 10px; }
    }`;
  };

  // Generate complete HTML template with data and scripts
  const generateHTMLTemplate = (
    chartData: ChartData,
    inventory: InventoryData | SnapshotLike,
  ): string => {
    const { infra, vms } = inventory;
    const {
      powerStateData,
      resourceData,
      osData,
      warningsData,
      storageLabels,
      storageUsedData,
      storageTotalData,
    } = chartData;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VMware Infrastructure Assessment Report</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        ${generateHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VMware Infrastructure Assessment Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h4>Total VMs</h4>
                <div class="number">${vms.total}</div>
            </div>
            <div class="summary-card" style="background: #e74c3c;">
                <h4>ESXi Hosts</h4>
                <div class="number">${infra.totalHosts}</div>
            </div>
            <div class="summary-card" style="background: #27ae60;">
                <h4>Datastores</h4>
                <div class="number">${infra.datastores.length}</div>
            </div>
            <div class="summary-card" style="background: #f39c12;">
                <h4>Networks</h4>
                <div class="number">${infra.networks.length}</div>
            </div>
        </div>

        <div class="chart-grid">
            <div class="chart-container">
                <h3>VM Power States Distribution</h3>
                <div class="chart-wrapper">
                    <canvas id="powerChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h3>Resource Utilization</h3>
                <div class="chart-wrapper">
                    <canvas id="resourceChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h3>Top Operating Systems</h3>
                <div class="chart-wrapper">
                    <canvas id="osChart"></canvas>
                </div>
            </div>

            ${
              vms.migrationWarnings.length > 0
                ? `
            <div class="chart-container">
                <h3>Migration Warnings</h3>
                <div class="chart-wrapper">
                    <canvas id="warningsChart"></canvas>
                </div>
            </div>`
                : ''
            }

            ${
              infra.datastores.length > 0
                ? `
            <div class="chart-container">
                <h3>Storage Utilization by Datastore</h3>
                <div class="chart-wrapper">
                    <canvas id="storageChart"></canvas>
                </div>
            </div>`
                : ''
            }
        </div>

        <div class="section">
            <h2>Detailed Analysis Tables</h2>
            
            <div class="table-section">
                <h3>Operating System Distribution</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Operating System</th>
                            <th>VM Count</th>
                            <th>Percentage</th>
                            <th>Migration Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateOSTable(vms)}
                    </tbody>
                </table>
            </div>

            <div class="table-section">
                <h3>Resource Allocation Analysis</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Resource Type</th>
                            <th>Current Total</th>
                            <th>Average per VM</th>
                            <th>Recommended Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>CPU Cores (vCPUs)</strong></td>
                            <td>${vms.cpuCores.total}</td>
                            <td>${(vms.cpuCores.total / vms.total).toFixed(
                              1,
                            )}</td>
                            <td>${Math.round(
                              vms.cpuCores.total * 1.2,
                            )} (with 20% overhead)</td>
                        </tr>
                        <tr>
                            <td><strong>Memory (GB)</strong></td>
                            <td>${vms.ramGB.total}</td>
                            <td>${(vms.ramGB.total / vms.total).toFixed(1)}</td>
                            <td>${Math.round(
                              vms.ramGB.total * 1.25,
                            )} (with 25% overhead)</td>
                        </tr>
                        <tr>
                            <td><strong>Storage (GB)</strong></td>
                            <td>${vms.diskGB.total}</td>
                            <td>${(vms.diskGB.total / vms.total).toFixed(
                              1,
                            )}</td>
                            <td>${Math.round(
                              vms.diskGB.total * 1.15,
                            )} (with 15% overhead)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${generateWarningsTable(vms)}

            <div class="table-section">
                <h3>Storage Infrastructure</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Type</th>
                            <th>Protocol</th>
                            <th>Total Capacity (GB)</th>
                            <th>Free Capacity (GB)</th>
                            <th>Utilization %</th>
                            <th>Hardware Acceleration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateStorageTable(infra)}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>VMware Infrastructure Assessment Report - Generated from live inventory data</p>
            <p>Charts are interactive - hover for details, click legend items to show/hide data series.</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Power States Doughnut Chart
            const powerCtx = document.getElementById('powerChart');
            if (powerCtx) {
                new Chart(powerCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ${JSON.stringify(
                          powerStateData.map((d) => d[0]),
                        ).replace(/<\//g, '<\\/')},
                        datasets: [{
                            data: ${JSON.stringify(
                              powerStateData.map((d) => d[1]),
                            )},
                            backgroundColor: ['${CHART_COLORS.SUCCESS}', '${
                              CHART_COLORS.DANGER
                            }', '${CHART_COLORS.WARNING}']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }

            // Resource Utilization Bar Chart
            const resourceCtx = document.getElementById('resourceChart');
            if (resourceCtx) {
                new Chart(resourceCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(
                          resourceData.map((d) => d[0]),
                        ).replace(/<\//g, '<\\/')},
                        datasets: [{
                            label: 'Current',
                            data: ${JSON.stringify(
                              resourceData.map((d) => d[1]),
                            )},
                            backgroundColor: '${CHART_COLORS.PRIMARY}'
                        }, {
                            label: 'Recommended',
                            data: ${JSON.stringify(
                              resourceData.map((d) => d[2]),
                            )},
                            backgroundColor: '${CHART_COLORS.SUCCESS}'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }

            // Operating Systems Horizontal Bar Chart
            const osCtx = document.getElementById('osChart');
            if (osCtx) {
                new Chart(osCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(
                          osData.map((d) => d[0]),
                        ).replace(/<\//g, '<\\/')},
                        datasets: [{
                            data: ${JSON.stringify(osData.map((d) => d[1]))},
                            backgroundColor: ${JSON.stringify([
                              CHART_COLORS.PRIMARY,
                              CHART_COLORS.DANGER,
                              CHART_COLORS.SUCCESS,
                              CHART_COLORS.WARNING,
                              CHART_COLORS.INFO,
                              CHART_COLORS.SECONDARY,
                              CHART_COLORS.DARK,
                              CHART_COLORS.ORANGE,
                            ])}
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true } }
                    }
                });
            }

            ${
              vms.migrationWarnings.length > 0
                ? `
            // Migration Warnings Chart
            const warningsCtx = document.getElementById('warningsChart');
            if (warningsCtx) {
                new Chart(warningsCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(
                          warningsData.map((d) => d[0]),
                        ).replace(/<\//g, '<\\/')},
                        datasets: [{
                            data: ${JSON.stringify(
                              warningsData.map((d) => d[1]),
                            )},
                            backgroundColor: ${JSON.stringify(
                              warningsData.map((d) => {
                                const count = Number(d[1]);
                                return count > 50
                                  ? CHART_COLORS.DANGER
                                  : count > 20
                                    ? CHART_COLORS.WARNING
                                    : count > 5
                                      ? CHART_COLORS.SUCCESS
                                      : CHART_COLORS.PRIMARY;
                              }),
                            )}
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }`
                : ''
            }

            ${
              infra.datastores.length > 0
                ? `
            // Storage Utilization Chart
            const storageCtx = document.getElementById('storageChart');
            if (storageCtx) {
                new Chart(storageCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(storageLabels).replace(
                          /<\//g,
                          '<\\/',
                        )},
                        datasets: [{
                            label: 'Used (GB)',
                            data: ${JSON.stringify(storageUsedData)},
                            backgroundColor: '${CHART_COLORS.DANGER}'
                        }, {
                            label: 'Total (GB)',
                            data: ${JSON.stringify(storageTotalData)},
                            backgroundColor: '${CHART_COLORS.PRIMARY}'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }`
                : ''
            }
        });
    </script>
</body>
</html>`;
  };

  // Download HTML file
  const downloadHTMLFile = (content: string, filename: string): void => {
    const htmlBlob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = filename;
    document.body.appendChild(htmlLink);
    htmlLink.click();
    URL.revokeObjectURL(htmlUrl);
    document.body.removeChild(htmlLink);
  };

  const handleHTMLExport = async (): Promise<void> => {
    try {
      setLoadingState('generating-html');
      setError(null);

      if (!sourceData?.inventory && !snapshot?.inventory) {
        throw new Error('No inventory data available for export');
      }

      const { inventory } = sourceData || snapshot;
      const chartData = generateChartData(inventory);
      const htmlContent = generateHTMLTemplate(chartData, inventory);
      downloadHTMLFile(htmlContent, EXPORT_CONFIG.HTML_FILENAME);
      console.log(
        '✅ Comprehensive HTML file with enhanced charts and tables downloaded successfully!',
      );
      setLoadingState('idle');
    } catch (error) {
      console.error('Error generating HTML file:', error);
      setError({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate HTML file',
        type: 'html',
      });
      setLoadingState('error');
    }
  };

  const exportOptions: ExportOption[] = [
    {
      key: 'pdf',
      label: 'PDF (View Only)',
      description: 'Static PDF report',
      action: handleDownloadPDF,
    },
    {
      key: 'html-interactive',
      label: 'Export HTML (coming soon)',
      description: 'Interactive charts',
      action: handleHTMLExport,
      disabled: true,
    },
  ];

  const onToggleClick = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onSelect = (): void => {
    setIsDropdownOpen(false);
    setError(null); // Clear any previous errors when dropdown closes
  };

  return (
    <>
      <Dropdown
        isOpen={isDropdownOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isDropdownOpen}
            variant="secondary"
            isDisabled={isLoading}
            aria-label="Export report options"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" aria-hidden="true" />
                {loadingState === 'generating-pdf'
                  ? 'Generating PDF...'
                  : 'Generating HTML...'}
              </>
            ) : (
              <>
                <DownloadIcon aria-hidden="true" /> Export Report
              </>
            )}
          </MenuToggle>
        )}
      >
        <DropdownList className="dropdown-list-reset">
          {exportOptions.map((option) => (
            <DropdownItem
              key={option.key}
              onClick={option.action}
              description={option.description}
              isDisabled={option.disabled}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>

      {error && (
        <Alert
          variant="danger"
          isInline
          title="An error occurred"
          style={{ marginTop: '0.5rem' }}
        >
          {error.message}
        </Alert>
      )}

      <div
        id="hidden-container"
        ref={hiddenContainerRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: `${EXPORT_CONFIG.HIDDEN_CONTAINER_WIDTH}px`,
          minHeight: `${EXPORT_CONFIG.HIDDEN_CONTAINER_HEIGHT}px`,
          padding: '2rem',
          backgroundColor: 'white',
          zIndex: -1,
        }}
      />
    </>
  );
};

export default EnhancedDownloadButton;
