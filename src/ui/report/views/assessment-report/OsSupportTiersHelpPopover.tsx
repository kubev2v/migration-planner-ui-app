import { css } from "@emotion/css";
import { Label } from "@patternfly/react-core";
import { RhUiExternalLinkIcon } from "@patternfly/react-icons";
import React from "react";

import PopoverIcon from "../cluster-sizer/PopoverIcon";
import {
  getSupportTierBadgeColor,
  getSupportTierDefinition,
  getSupportTierLegendLabel,
  ORDERED_SUPPORT_TIERS,
  SUPPORT_TIER_LEARN_MORE_URL,
} from "./osSupportTier";

const tierListStyle = css`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-t--global--spacer--400);
`;

const tierItemStyle = css`
  display: flex;
  flex-direction: column;
  gap: var(--pf-t--global--spacer--100);
`;

const tierBadgeStyle = css`
  width: fit-content;
  max-width: 100%;
  align-self: flex-start;
`;

const tierDescriptionStyle = css`
  margin: 0;
  color: var(--pf-t--global--text--color--regular);
`;

const learnMoreLinkStyle = css`
  display: inline-flex;
  align-items: center;
  gap: var(--pf-t--global--spacer--xs);
  margin-top: var(--pf-t--global--spacer--400);
`;

const OsSupportTiersHelpBody: React.FC = () => (
  <div>
    <ul className={tierListStyle}>
      {ORDERED_SUPPORT_TIERS.map((tier) => (
        <li key={tier} className={tierItemStyle}>
          <Label
            className={tierBadgeStyle}
            color={getSupportTierBadgeColor(tier)}
            isCompact
          >
            {getSupportTierLegendLabel(tier)}
          </Label>
          <p className={tierDescriptionStyle}>
            {getSupportTierDefinition(tier)}
          </p>
        </li>
      ))}
    </ul>
    <a
      className={learnMoreLinkStyle}
      href={SUPPORT_TIER_LEARN_MORE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn more <RhUiExternalLinkIcon />
    </a>
  </div>
);

export const OsSupportTiersHelpPopover: React.FC = () => (
  <PopoverIcon
    noVerticalAlign
    maxWidth="40rem"
    headerContent="Guest OS support tiers"
    bodyContent={<OsSupportTiersHelpBody />}
    buttonOuiaId="guest-os-support-tiers-help"
    aria-label="Guest OS support tiers help"
  />
);

OsSupportTiersHelpPopover.displayName = "OsSupportTiersHelpPopover";

export default OsSupportTiersHelpPopover;
