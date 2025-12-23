import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportExportService } from './ReportExportService';
import type { HtmlGenerator } from './HtmlGenerator';
import type { PdfGenerator } from './PdfGenerator';
import type { InventoryData } from './types';

describe('ReportExportService', () => {
  let mockPdfGenerator: PdfGenerator;
  let mockHtmlGenerator: HtmlGenerator;
  let service: ReportExportService;

  const mockInventory: InventoryData = {
    infra: {
      totalHosts: 2,
      datastores: [],
      networks: [],
    },
    vms: {
      total: 10,
      powerStates: { poweredOn: 8, poweredOff: 2 },
      cpuCores: { total: 50 },
      ramGB: { total: 128 },
      diskGB: { total: 1000 },
      migrationWarnings: [],
    },
  };

  beforeEach(() => {
    mockPdfGenerator = {
      generate: vi.fn().mockResolvedValue(undefined),
    } as unknown as PdfGenerator;

    mockHtmlGenerator = {
      generate: vi.fn().mockResolvedValue(undefined),
    } as unknown as HtmlGenerator;

    service = new ReportExportService({
      pdfGenerator: mockPdfGenerator,
      htmlGenerator: mockHtmlGenerator,
    });
  });

  describe('constructor', () => {
    it('should use provided generators', () => {
      const customService = new ReportExportService({
        pdfGenerator: mockPdfGenerator,
        htmlGenerator: mockHtmlGenerator,
      });

      // The service should be created without errors
      expect(customService).toBeInstanceOf(ReportExportService);
    });

    it('should create default generators when none provided', () => {
      const defaultService = new ReportExportService();

      // The service should be created without errors
      expect(defaultService).toBeInstanceOf(ReportExportService);
    });

    it('should create default generators when empty object provided', () => {
      const defaultService = new ReportExportService({});

      expect(defaultService).toBeInstanceOf(ReportExportService);
    });
  });

  describe('exportPdf()', () => {
    it('should return success when PDF generation succeeds', async () => {
      const mockComponent = 'mock-component' as unknown as React.ReactNode;

      const result = await service.exportPdf(mockComponent);

      expect(result).toEqual({ success: true });
      expect(mockPdfGenerator.generate).toHaveBeenCalledWith(
        mockComponent,
        undefined,
      );
    });

    it('should pass options to the PDF generator', async () => {
      const mockComponent = 'mock-component' as unknown as React.ReactNode;
      const options = { documentTitle: 'Test Report' };

      await service.exportPdf(mockComponent, options);

      expect(mockPdfGenerator.generate).toHaveBeenCalledWith(
        mockComponent,
        options,
      );
    });

    it('should return error with message when generator throws Error', async () => {
      const errorMessage = 'PDF generation failed';
      vi.mocked(mockPdfGenerator.generate).mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await service.exportPdf(
        'component' as unknown as React.ReactNode,
      );

      expect(result).toEqual({
        success: false,
        error: {
          message: errorMessage,
          type: 'pdf',
        },
      });
    });

    it('should return generic error message when generator throws non-Error', async () => {
      vi.mocked(mockPdfGenerator.generate).mockRejectedValue('string error');

      const result = await service.exportPdf(
        'component' as unknown as React.ReactNode,
      );

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Failed to generate PDF',
          type: 'pdf',
        },
      });
    });

    it('should return generic error message when generator throws null', async () => {
      vi.mocked(mockPdfGenerator.generate).mockRejectedValue(null);

      const result = await service.exportPdf(
        'component' as unknown as React.ReactNode,
      );

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Failed to generate PDF',
          type: 'pdf',
        },
      });
    });
  });

  describe('exportHtml()', () => {
    it('should return success when HTML generation succeeds', async () => {
      const result = await service.exportHtml(mockInventory);

      expect(result).toEqual({ success: true });
      expect(mockHtmlGenerator.generate).toHaveBeenCalledWith(
        mockInventory,
        undefined,
      );
    });

    it('should pass options to the HTML generator', async () => {
      const options = { documentTitle: 'Test Report', filename: 'report.html' };

      await service.exportHtml(mockInventory, options);

      expect(mockHtmlGenerator.generate).toHaveBeenCalledWith(
        mockInventory,
        options,
      );
    });

    it('should return error with message when generator throws Error', async () => {
      const errorMessage = 'HTML generation failed';
      vi.mocked(mockHtmlGenerator.generate).mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await service.exportHtml(mockInventory);

      expect(result).toEqual({
        success: false,
        error: {
          message: errorMessage,
          type: 'html',
        },
      });
    });

    it('should return generic error message when generator throws non-Error', async () => {
      vi.mocked(mockHtmlGenerator.generate).mockRejectedValue('string error');

      const result = await service.exportHtml(mockInventory);

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Failed to generate HTML file',
          type: 'html',
        },
      });
    });

    it('should return generic error message when generator throws undefined', async () => {
      vi.mocked(mockHtmlGenerator.generate).mockRejectedValue(undefined);

      const result = await service.exportHtml(mockInventory);

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Failed to generate HTML file',
          type: 'html',
        },
      });
    });

    it('should handle SnapshotLike inventory format', async () => {
      const snapshotInventory = {
        createdAt: new Date(),
        vcenterId: 'vcenter-1',
        infra: mockInventory.infra,
        vms: mockInventory.vms,
      };

      const result = await service.exportHtml(snapshotInventory);

      expect(result).toEqual({ success: true });
      expect(mockHtmlGenerator.generate).toHaveBeenCalledWith(
        snapshotInventory,
        undefined,
      );
    });
  });
});

