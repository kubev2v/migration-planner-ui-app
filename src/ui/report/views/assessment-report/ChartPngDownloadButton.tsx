import { css } from "@emotion/css";
import {
  Button,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Tooltip,
} from "@patternfly/react-core";
import { RhUiDownloadIcon } from "@patternfly/react-icons";
import React, { useCallback, useState } from "react";

import { themeTooltipFlyoutProps } from "../../../../lib/patternfly/flyoutAppendTo";
import { CHART_EXPORT_ATTR } from "../../../../services/png-export/PngExportService";
import { useReportChartExport } from "../../view-models/ReportChartExportContext";
import { chartExportDownloadOverlay, chartExportWrap } from "./styles";

const headerActions = css`
  flex-shrink: 0;
`;

/**
 * Per-card PNG download. Hidden when PNG export is not provided
 * (example reports, off-screen PDF tree).
 */
export const ChartPngDownloadButton: React.FC = () => {
  const chartExport = useReportChartExport();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      event.preventDefault();
      event.stopPropagation();
      if (!chartExport) {
        return;
      }

      const card = event.currentTarget.closest<HTMLElement>(
        `[${CHART_EXPORT_ATTR}]`,
      );
      if (!card) {
        return;
      }

      const filename = card.getAttribute(CHART_EXPORT_ATTR) || "chart";
      setIsDownloading(true);
      try {
        await chartExport.exportPngChart(card, filename);
      } finally {
        setIsDownloading(false);
      }
    },
    [chartExport],
  );

  if (!chartExport) {
    return null;
  }

  const isDisabled = isDownloading || chartExport.isExporting;

  return (
    <Tooltip {...themeTooltipFlyoutProps} content="Download chart as PNG">
      <span data-chart-download="">
        <Button
          variant="plain"
          aria-label="Download chart as PNG"
          isDisabled={isDisabled}
          onClick={(event) => {
            void handleClick(event);
          }}
          icon={
            isDownloading ? (
              <Spinner size="sm" aria-hidden="true" />
            ) : (
              <Icon size="md" isInline>
                <RhUiDownloadIcon />
              </Icon>
            )
          }
        />
      </span>
    </Tooltip>
  );
};

ChartPngDownloadButton.displayName = "ChartPngDownloadButton";

interface ChartExportCardProps {
  filename: string;
  showDownload?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a shared-component card so it can be snapshot (ZIP) and optionally
 * host the per-card PNG download overlay.
 */
export const ChartExportCard: React.FC<ChartExportCardProps> = ({
  filename,
  showDownload = true,
  children,
}) => (
  <div className={chartExportWrap} data-chart-export={filename}>
    {children}
    {showDownload ? (
      <div className={chartExportDownloadOverlay}>
        <ChartPngDownloadButton />
      </div>
    ) : null}
  </div>
);

ChartExportCard.displayName = "ChartExportCard";

interface ChartCardHeaderActionsProps {
  children?: React.ReactNode;
}

/**
 * Right-side card header cluster: optional view-mode control (excluded from
 * PNG snapshots) plus the per-card download button when export is available.
 */
export const ChartCardHeaderActions: React.FC<ChartCardHeaderActionsProps> = ({
  children,
}) => {
  const chartExport = useReportChartExport();
  if (!chartExport && !children) {
    return null;
  }

  return (
    <FlexItem className={headerActions}>
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        spaceItems={{ default: "spaceItemsSm" }}
      >
        {children ? (
          <FlexItem data-chart-export-exclude="">{children}</FlexItem>
        ) : null}
        {chartExport ? (
          <FlexItem>
            <ChartPngDownloadButton />
          </FlexItem>
        ) : null}
      </Flex>
    </FlexItem>
  );
};

ChartCardHeaderActions.displayName = "ChartCardHeaderActions";
