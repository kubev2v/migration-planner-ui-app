import {
  type ReportExportOption,
  type StandardReportExportHandlers,
  standardReportExportOptions,
} from "@openshift-migration-advisor/shared-components";

export function buildReportExportOptions(
  handlers: StandardReportExportHandlers,
): ReportExportOption[] {
  return standardReportExportOptions(handlers);
}
