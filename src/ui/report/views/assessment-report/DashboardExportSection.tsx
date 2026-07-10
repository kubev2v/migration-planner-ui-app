import React from "react";

import {
  storageExportSectionMargin,
  storageExportSectionTitle,
} from "./styles";

export interface DashboardExportSectionProps {
  title: string;
  withMargin?: boolean;
  children: React.ReactNode;
}

export const DashboardExportSection: React.FC<DashboardExportSectionProps> = ({
  title,
  withMargin = false,
  children,
}) => (
  <div className={withMargin ? storageExportSectionMargin : undefined}>
    <div className={storageExportSectionTitle}>{title}</div>
    {children}
  </div>
);

DashboardExportSection.displayName = "DashboardExportSection";
