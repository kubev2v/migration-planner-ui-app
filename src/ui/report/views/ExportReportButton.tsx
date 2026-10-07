import {
  type PdfTextPage,
  ReportExportMenu,
  useChartExport,
} from "@openshift-migration-advisor/shared-components";
import React from "react";

import { buildReportExportOptions } from "../helpers/reportExportOptions";

interface ExportReportButtonProps {
  documentTitle: string;
  isDisabled?: boolean;
  /**
   * Calculated cluster sizing recommendations (if any) to append as extra
   * pages in the exported PDF. @see OMA-2414
   */
  pdfExtraPages?: PdfTextPage[];
}

export const ExportReportButton: React.FC<ExportReportButtonProps> = ({
  documentTitle,
  isDisabled = false,
  pdfExtraPages,
}): JSX.Element => {
  const charts = useChartExport();
  const exportOptions = buildReportExportOptions({
    onExportPdf: charts
      ? () => {
          void charts.downloadPdf(documentTitle, pdfExtraPages);
        }
      : undefined,
    onExportPng: charts
      ? () => {
          void charts.downloadAll();
        }
      : undefined,
    onExportHtml: charts
      ? () => {
          void charts.downloadHtml(documentTitle);
        }
      : undefined,
  });

  return (
    <ReportExportMenu
      options={exportOptions}
      isLoading={Boolean(charts?.isBusy)}
      loadingLabel={charts?.exportLoadingLabel}
      isDisabled={isDisabled}
      toggleLabel="Export Report"
    />
  );
};

ExportReportButton.displayName = "ExportReportButton";
