import { css, cx } from "@emotion/css";

/**
 * DOM target for portaled PatternFly flyouts (Popover, Tooltip).
 * Uses `document.body` so flyouts inherit Red Hat Text from PatternFly base styles.
 * Appending to `document.documentElement` (where the theme class often lives) leaves
 * flyouts outside `body` and they fall back to the browser serif default.
 */
export const getFlyoutAppendTo = (): HTMLElement => document.body;

/** Shared typography for portaled popover and tooltip content. */
export const flyoutTypographyClassName = css`
  .pf-v6-c-popover__content,
  .pf-v6-c-popover__title-text,
  .pf-v6-c-tooltip__content {
    font-family: var(--pf-t--global--font--family--body);
    line-height: var(--pf-t--global--font--line-height--body);
  }

  .pf-v6-c-tooltip__content {
    font-size: var(--pf-t--global--font--size--body--sm);
  }
`;

/** Popover color tokens that respect the active PatternFly theme. */
export const themeAwarePopoverClassName = css`
  --pf-v6-c-popover__content--BackgroundColor: var(
    --pf-t--global--background--color--floating--default
  );
  --pf-v6-c-popover__content--Color: var(--pf-t--global--text--color--regular);
  --pf-v6-c-popover__arrow--BackgroundColor: var(
    --pf-t--global--background--color--floating--default
  );
  --pf-v6-c-popover__arrow--BorderColor: var(
    --pf-t--global--border--color--default
  );
`;

/** Tooltip color tokens that respect the active PatternFly theme. */
export const themeAwareTooltipClassName = css`
  --pf-v6-c-tooltip__content--BackgroundColor: var(
    --pf-t--global--background--color--floating--default
  );
  --pf-v6-c-tooltip__content--Color: var(--pf-t--global--text--color--regular);
  --pf-v6-c-tooltip__arrow--BackgroundColor: var(
    --pf-t--global--background--color--floating--default
  );
  --pf-v6-c-tooltip__arrow--BorderColor: var(
    --pf-t--global--border--color--default
  );
`;

/** Typography + theme tokens for popovers. */
export const themePopoverFlyoutClassName = cx(
  flyoutTypographyClassName,
  themeAwarePopoverClassName,
);

/** Typography + theme tokens for tooltips. */
export const themeTooltipFlyoutClassName = cx(
  flyoutTypographyClassName,
  themeAwareTooltipClassName,
);

/** Victory chart tooltips (Voronoi) that respect the active PatternFly theme. */
export const themedChartTooltipStyle = {
  fontSize: 9,
  fill: "var(--pf-t--global--text--color--regular)",
} as const;

export const themedChartTooltipFlyoutStyle = {
  stroke: "var(--pf-t--global--border--color--default)",
  strokeWidth: 1,
  fill: "var(--pf-t--global--background--color--floating--default)",
} as const;

export const themedChartTooltipFlyoutPadding = {
  top: 6,
  bottom: 6,
  left: 10,
  right: 10,
} as const;

/** Shared props for theme-aware PatternFly Popovers. */
export const themePopoverFlyoutProps = {
  appendTo: getFlyoutAppendTo,
  className: themePopoverFlyoutClassName,
} as const;

/** Shared props for theme-aware PatternFly Tooltips. */
export const themeTooltipFlyoutProps = {
  appendTo: getFlyoutAppendTo,
  className: themeTooltipFlyoutClassName,
} as const;
