import { css } from "@emotion/css";

// ---------------------------------------------------------------------------
// Shared base card properties (replaces global .pf-v6-c-card override)
// ---------------------------------------------------------------------------
const cardBase = `
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// ---------------------------------------------------------------------------
// Reusable dashboard card styles
// ---------------------------------------------------------------------------

/** Standard dashboard card with min/max height and shadow. */
export const dashboardCard = css`
  ${cardBase}
  min-height: 430px;
  max-height: 520px;
  justify-content: space-between;
`;

// ---------------------------------------------------------------------------
// StorageOverview-specific styles
// ---------------------------------------------------------------------------

export const storageCardOverflowHidden = css`
  overflow: hidden;
`;

export const storageCardOverflowVisible = css`
  overflow: visible;
`;

export const storageFlexFullWidth = css`
  width: 100%;
`;

export const storageMenuToggleMinWidth = css`
  min-width: 250px;
`;

export const storageChartWrapper = css`
  display: flex;
  justify-content: center;
`;

export const storageTotalsNote = css`
  color: var(--pf-t--global--text--color--subtle);
  margin-left: 20px;
`;

export const storageExportSectionMargin = css`
  margin-bottom: 24px;
`;

export const storageExportSectionTitle = css`
  font-weight: 600;
  margin-bottom: 8px;
`;

/** Wrapper so a shared-component card can host the PNG download control. */
export const chartExportWrap = css`
  position: relative;
  height: 100%;
`;

export const chartExportDownloadOverlay = css`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
`;

/** Lightweight graph-only surface used by PNG ZIP (and later PDF). */
export const exportGraphFrame = css`
  width: 720px;
  padding: 16px;
  background-color: var(--pf-t--global--background--color--primary--default);
  color: var(--pf-t--global--text--color--regular);
`;

export const exportGraphTitle = css`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 12px;
`;
