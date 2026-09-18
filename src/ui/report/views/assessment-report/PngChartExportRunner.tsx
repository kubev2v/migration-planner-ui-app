/**
 * Hidden host that ZIP-exports graph-only chart frames from one off-screen tree.
 *
 * Paint every export chart once, capture Blobs in sequence, then unmount.
 * SVG charts are rasterized natively; HTML-only views still use modern-screenshot.
 */

import { css } from "@emotion/css";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import type { PngZipSession } from "../../../../data/stores/interfaces/IReportStore";
import type { PngChartExportJob } from "./PngChartExportJobs";

export const PNG_EXPORT_ROOT_ATTR = "data-png-export-root";

const offScreenHost = css`
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: -1;
  pointer-events: none;
`;

const offScreenCard = css`
  width: 720px;
  margin-bottom: 24px;
  background-color: var(--pf-t--global--background--color--primary--default);

  .pf-v6-c-card {
    max-height: none !important;
    overflow: visible !important;
  }
`;

export interface PngChartExportRunnerHandle {
  run: (jobs: PngChartExportJob[]) => void;
}

interface PngChartExportRunnerProps {
  enabled: boolean;
  exportPngZip: (run: (session: PngZipSession) => Promise<void>) => void;
  yieldToBrowser: () => Promise<void>;
}

export const PngChartExportRunner = forwardRef<
  PngChartExportRunnerHandle,
  PngChartExportRunnerProps
>(({ enabled, exportPngZip, yieldToBrowser }, ref) => {
  const [host] = useState(() => {
    const el = document.createElement("div");
    el.id = "png-hidden-container";
    el.className = offScreenHost;
    return el;
  });
  const [jobs, setJobs] = useState<PngChartExportJob[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    document.body.appendChild(host);
    return () => {
      host.remove();
    };
  }, [enabled, host]);

  useImperativeHandle(ref, () => ({
    run: (nextJobs: PngChartExportJob[]): void => {
      if (!enabled || nextJobs.length === 0) {
        return;
      }

      exportPngZip(async (session) => {
        try {
          flushSync(() => {
            setJobs(nextJobs);
          });
          await yieldToBrowser();

          for (const job of nextJobs) {
            const chartRoot = host.querySelector<HTMLElement>(
              `[${PNG_EXPORT_ROOT_ATTR}="${job.filename}"]`,
            );
            if (!chartRoot) {
              throw new Error(`Failed to render chart "${job.filename}"`);
            }

            await session.addChart(chartRoot, job.filename);
          }
        } finally {
          flushSync(() => {
            setJobs([]);
          });
        }
      });
    },
  }));

  if (!enabled) {
    return null;
  }

  return createPortal(
    <>
      {jobs.map((job) => (
        <div
          key={job.filename}
          className={offScreenCard}
          data-png-export-root={job.filename}
          data-chart-export={job.filename}
        >
          {job.render()}
        </div>
      ))}
    </>,
    host,
  );
});

PngChartExportRunner.displayName = "PngChartExportRunner";
