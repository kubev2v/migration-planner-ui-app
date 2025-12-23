import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from 'vitest';
import { HtmlGenerator } from './HtmlGenerator';
import { DEFAULT_DOCUMENT_TITLE } from './constants';
import type { InventoryData } from './types';

// Mock the download functionality to prevent actual file downloads during tests
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

/**
 * Helper to read Blob content as text (compatible with jsdom)
 */
async function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('HtmlGenerator', () => {
  let generator: HtmlGenerator;
  let mockAppendChild: MockInstance;
  let mockRemoveChild: MockInstance;
  let capturedLink: HTMLAnchorElement | null = null;

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
    generator = new HtmlGenerator();
    capturedLink = null;

    // Mock document.body methods
    mockAppendChild = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((element: Node) => {
        capturedLink = element as HTMLAnchorElement;
        return element;
      });
    mockRemoveChild = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((element: Node) => element);

    // Mock link.click
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  describe('generate()', () => {
    it('should throw error when inventory is null', async () => {
      await expect(
        generator.generate(null as unknown as InventoryData),
      ).rejects.toThrow('No inventory data available for export');
    });

    it('should generate HTML with default title when documentTitle is not provided', async () => {
      // Capture the Blob passed to createObjectURL
      let capturedBlob: Blob | null = null;
      mockCreateObjectURL.mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test-url';
      });

      await generator.generate(mockInventory);

      expect(capturedBlob).not.toBeNull();
      const htmlContent = await readBlobAsText(capturedBlob!);
      expect(htmlContent).toContain(`<title>${DEFAULT_DOCUMENT_TITLE}</title>`);
      expect(htmlContent).toContain(`<h1>${DEFAULT_DOCUMENT_TITLE}</h1>`);
    });

    it('should generate HTML with custom title when documentTitle is provided', async () => {
      let capturedBlob: Blob | null = null;
      mockCreateObjectURL.mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test-url';
      });

      const customTitle = 'My Custom Report';
      await generator.generate(mockInventory, { documentTitle: customTitle });

      expect(capturedBlob).not.toBeNull();
      const htmlContent = await readBlobAsText(capturedBlob!);
      expect(htmlContent).toContain(`<title>${customTitle}</title>`);
      expect(htmlContent).toContain(`<h1>${customTitle}</h1>`);
    });

    it('should use default title when documentTitle is undefined', async () => {
      let capturedBlob: Blob | null = null;
      mockCreateObjectURL.mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test-url';
      });

      await generator.generate(mockInventory, { documentTitle: undefined });

      expect(capturedBlob).not.toBeNull();
      const htmlContent = await readBlobAsText(capturedBlob!);
      expect(htmlContent).toContain(`<title>${DEFAULT_DOCUMENT_TITLE}</title>`);
    });

    it('should use custom filename when provided', async () => {
      await generator.generate(mockInventory, {
        filename: 'custom-report.html',
      });

      expect(capturedLink).not.toBeNull();
      expect(capturedLink!.download).toBe('custom-report.html');
    });
  });
});
