import React, {
  createContext,
  type PropsWithChildren,
  useContext,
} from "react";

export interface ReportChartExportContextValue {
  exportPngChart: (element: HTMLElement, filename: string) => Promise<void>;
  isExporting: boolean;
}

const ReportChartExportContext =
  createContext<ReportChartExportContextValue | null>(null);

interface ReportChartExportProviderProps extends PropsWithChildren {
  exportPngChart: ReportChartExportContextValue["exportPngChart"];
  isExporting: boolean;
}

/**
 * Shares PNG chart-download handlers with nested dashboard cards.
 * Only wrap the on-screen Dashboard (not the off-screen PDF tree).
 */
export const ReportChartExportProvider: React.FC<
  ReportChartExportProviderProps
> = ({ exportPngChart, isExporting, children }) => (
  <ReportChartExportContext.Provider value={{ exportPngChart, isExporting }}>
    {children}
  </ReportChartExportContext.Provider>
);

ReportChartExportProvider.displayName = "ReportChartExportProvider";

export const useReportChartExport = (): ReportChartExportContextValue | null =>
  useContext(ReportChartExportContext);
