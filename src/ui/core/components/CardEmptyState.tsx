import { css } from "@emotion/css";
import { EmptyState, EmptyStateBody } from "@patternfly/react-core";
import { RhUiSearchIcon } from "@patternfly/react-icons";
import React from "react";

export const CARD_EMPTY_STATE_DESCRIPTION =
  "This data is not available for older inventories or certain imported reports.";

const cardEmptyStateContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-height: 250px;
`;

export interface CardEmptyStateProps {
  title: string;
  description?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  title,
  description = CARD_EMPTY_STATE_DESCRIPTION,
}) => {
  return (
    <div className={cardEmptyStateContainer}>
      <EmptyState
        headingLevel="h4"
        icon={RhUiSearchIcon}
        titleText={title}
        variant="sm"
      >
        <EmptyStateBody>{description}</EmptyStateBody>
      </EmptyState>
    </div>
  );
};

CardEmptyState.displayName = "CardEmptyState";
