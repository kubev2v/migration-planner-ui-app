import { css } from "@emotion/css";

export const upgradeRecommendationPopoverCloseButton = css`
  .pf-v6-c-popover__close .pf-v6-c-button.pf-m-plain,
  .pf-v6-c-popover__close .pf-v6-c-button.pf-m-plain:hover {
    color: var(--pf-t--global--text--color--regular);
  }
`;

export const legendSwatch = css`
  width: 12px;
  height: 12px;
  border-radius: 2px;
`;

export const legendLabelWithTooltip = css`
  border-bottom: 1px dotted currentColor;
  cursor: help;
`;

export const chartScrollContainer = css`
  overflow-y: auto;
`;

export const chartScrollContainerAuto = css`
  max-height: none;
  overflow-y: visible;
`;

export const groupHeaderLabelCell = css`
  padding-left: 0;
  padding-bottom: 4px;
`;

export const groupHeaderLabelCellFirst = css`
  padding-top: 4px;
`;

export const groupHeaderLabelCellSubsequent = css`
  padding-top: 12px;
`;

export const groupHeaderCountCell = css`
  padding-right: 0;
  text-align: center;
  padding-bottom: 4px;
`;

export const groupHeaderText = css`
  font-size: clamp(0.45rem, 0.75vw, 1.15rem);
  font-weight: 600;
`;

export const dataRowNameCell = css`
  padding-left: 16px;
  padding-top: 4px;
`;

export const dataRowNameText = css`
  font-size: clamp(0.4rem, 0.7vw, 1.1rem);
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  text-transform: capitalize;
  -webkit-box-orient: vertical;
`;

export const infoButton = css`
  padding: 0;
  vertical-align: middle;
`;

export const barTrack = css`
  position: relative;
  background-color: var(--pf-t--global--background--color--secondary--default);
  overflow: hidden;
`;

export const barFill = css`
  height: 100%;
  transition: width 0.3s ease;
`;

export const countCell = css`
  padding-right: 0;
  text-align: center;
  padding-top: 5px;
`;

export const countText = css`
  font-size: clamp(0.4rem, 0.7vw, 1.1rem);
`;
