import React from "react";

import { exportGraphFrame, exportGraphTitle } from "./styles";

export interface ExportGraphFrameProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Chart-only export surface (no PatternFly Card chrome).
 * PNG ZIP uses this hidden-tree layout; PDF can share it later.
 */
export const ExportGraphFrame: React.FC<ExportGraphFrameProps> = ({
  title,
  children,
}) => (
  <div className={exportGraphFrame} data-export-graph="">
    <div className={exportGraphTitle} data-export-graph-title="">
      {title}
    </div>
    {children}
  </div>
);

ExportGraphFrame.displayName = "ExportGraphFrame";
