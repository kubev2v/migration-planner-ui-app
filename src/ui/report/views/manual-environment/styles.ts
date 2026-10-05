import { css } from "@emotion/css";

export const titleRow = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-t--global--spacer--md);
`;

export const emptyStatePanel = css`
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--medium);
  padding-block: var(--pf-t--global--spacer--2xl);
`;

export const radioRow = css`
  display: flex;
  gap: var(--pf-t--global--spacer--lg);
`;

export const countControl = css`
  width: fit-content;
`;

export const countInput = css`
  width: 4.5rem;
`;

export const placeholderText = css`
  color: var(--pf-t--global--text--color--subtle);
`;

export const wizardLayout = css`
  min-height: 32rem;
  width: 100%;
  align-self: stretch;

  .pf-v6-c-wizard__outer-wrap,
  .pf-v6-c-wizard__inner-wrap,
  .pf-v6-c-wizard__main,
  .pf-v6-c-wizard__main-body {
    width: 100%;
    align-items: stretch;
  }
`;

export const wizardFields = css`
  width: 100%;
  align-self: stretch;
`;

/** Dropdowns and text inputs span the wizard content, as in the UX proposal. */
export const fullWidthField = css`
  width: 100%;
  align-self: stretch;

  .pf-v6-c-form__group-control {
    width: 100%;
  }

  .pf-v6-c-menu-toggle,
  .pf-v6-c-form-control {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
  }

  .pf-v6-c-menu-toggle {
    display: flex;
    justify-content: flex-start;
  }
`;

export const summaryList = css`
  --pf-v6-c-description-list--RowGap: var(--pf-t--global--spacer--md);
`;
