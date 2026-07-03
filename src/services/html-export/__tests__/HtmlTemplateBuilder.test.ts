import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_DOCUMENT_TITLE,
  HtmlTemplateBuilder,
} from "../HtmlTemplateBuilder";
import type { ChartData, InventoryData } from "../types";

describe("HtmlTemplateBuilder", () => {
  let builder: HtmlTemplateBuilder;

  const mockChartData: ChartData = {
    powerStateData: [
      ["Powered On", 10],
      ["Powered Off", 5],
    ],
    resourceData: [["CPU", 100, 120]],
    osData: [["Linux", 8]],
    warningsData: [],
    storageLabels: ["DS1"],
    storageUsedData: [500],
    storageTotalData: [1000],
  };

  const mockInventory: InventoryData = {
    infra: {
      totalHosts: 3,
      datastores: [
        {
          vendor: "VMware",
          type: "VMFS",
          protocolType: "NFS",
          totalCapacityGB: 1000,
          freeCapacityGB: 500,
          hardwareAcceleratedMove: true,
        },
      ],
      networks: [{ name: "VM Network", type: "Standard" }],
    },
    vms: {
      total: 15,
      powerStates: { poweredOn: 10, poweredOff: 5 },
      cpuCores: { total: 100 },
      ramGB: { total: 256 },
      diskGB: { total: 2000 },
      migrationWarnings: [],
    },
  };

  beforeEach(() => {
    builder = new HtmlTemplateBuilder();
  });

  describe("build()", () => {
    describe("title customization", () => {
      it("should use the default title when no title is provided", () => {
        const html = builder.build(mockChartData, mockInventory);

        expect(html).toContain(`<title>${DEFAULT_DOCUMENT_TITLE}</title>`);
        expect(html).toContain(`<h1>${DEFAULT_DOCUMENT_TITLE}</h1>`);
      });

      it("should use the custom title when provided", () => {
        const customTitle = "My Custom Assessment Report";
        const html = builder.build(
          mockChartData,
          mockInventory,
          new Date(),
          customTitle,
        );

        expect(html).toContain(`<title>${customTitle}</title>`);
        expect(html).toContain(`<h1>${customTitle}</h1>`);
      });

      it("should escape HTML entities in the title", () => {
        const titleWithHtml = '<script>alert("xss")</script>';
        const html = builder.build(
          mockChartData,
          mockInventory,
          new Date(),
          titleWithHtml,
        );

        // The raw script tag should not appear unescaped
        expect(html).not.toContain('<script>alert("xss")</script>');
        // escapeHtml escapes <, >, & but not " (quotes don't need escaping in text content)
        expect(html).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
      });

      it("should handle empty string title by using it as-is", () => {
        const html = builder.build(
          mockChartData,
          mockInventory,
          new Date(),
          "",
        );

        expect(html).toContain("<title></title>");
        expect(html).toContain("<h1></h1>");
      });

      it("should handle title with special characters", () => {
        const specialTitle = "Report: Test & Demo (2024)";
        const html = builder.build(
          mockChartData,
          mockInventory,
          new Date(),
          specialTitle,
        );

        expect(html).toContain("Report: Test &amp; Demo (2024)");
      });
    });

    describe("generatedAt timestamp", () => {
      it("should use the provided date for timestamp", () => {
        const fixedDate = new Date("2024-06-15T10:30:00");
        const html = builder.build(mockChartData, mockInventory, fixedDate);

        expect(html).toContain(fixedDate.toLocaleDateString());
        expect(html).toContain(fixedDate.toLocaleTimeString());
      });
    });

    describe("HTML structure", () => {
      it("should generate valid HTML document structure", () => {
        const html = builder.build(mockChartData, mockInventory);

        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain('<html lang="en">');
        expect(html).toContain("<head>");
        expect(html).toContain("<body>");
        expect(html).toContain("</html>");
      });

      it("should include Chart.js script", () => {
        const html = builder.build(mockChartData, mockInventory);

        expect(html).toContain("cdnjs.cloudflare.com/ajax/libs/Chart.js");
      });
    });

    describe("inline chart script safety", () => {
      const scriptBreaker = "</script><img src=x onerror=alert(1)>";

      it("does not embed malicious strings in chart data arrays", () => {
        const chartData: ChartData = {
          ...mockChartData,
          storageTotalData: [scriptBreaker as unknown as number],
          storageUsedData: [scriptBreaker as unknown as number],
          powerStateData: [["Powered On", scriptBreaker as unknown as number]],
          resourceData: [
            [
              "CPU",
              scriptBreaker as unknown as number,
              scriptBreaker as unknown as number,
            ],
          ],
          osData: [["Linux", scriptBreaker as unknown as number]],
          warningsData: [["Warn", scriptBreaker as unknown as number]],
        };

        const html = builder.build(chartData, mockInventory);

        expect(html).not.toContain(scriptBreaker);
        expect(html).not.toContain("onerror=alert");
      });
    });

    describe("HTML body numeric safety", () => {
      const htmlBreaker = "<img src=x onerror=alert(1)>";

      it("does not embed malicious strings in summary counts", () => {
        const inventory: InventoryData = {
          ...mockInventory,
          vms: {
            ...mockInventory.vms,
            total: htmlBreaker as unknown as number,
          },
          infra: {
            ...mockInventory.infra,
            totalHosts: htmlBreaker as unknown as number,
          },
        };

        const html = builder.build(mockChartData, inventory);

        expect(html).not.toContain(htmlBreaker);
        expect(html).not.toContain("onerror=alert");
      });

      it("does not embed malicious strings in resource and warning table cells", () => {
        const inventory: InventoryData = {
          ...mockInventory,
          vms: {
            ...mockInventory.vms,
            total: htmlBreaker as unknown as number,
            cpuCores: { total: htmlBreaker as unknown as number },
            ramGB: { total: htmlBreaker as unknown as number },
            diskGB: { total: htmlBreaker as unknown as number },
            os: { Linux: htmlBreaker as unknown as number },
            migrationWarnings: [
              {
                label: "Test Warning",
                count: htmlBreaker as unknown as number,
              },
            ],
          },
        };

        const chartData: ChartData = {
          ...mockChartData,
          osData: [["Linux", htmlBreaker as unknown as number]],
        };

        const html = builder.build(chartData, inventory);

        expect(html).not.toContain(htmlBreaker);
        expect(html).not.toContain("onerror=alert");
      });
    });
  });
});
