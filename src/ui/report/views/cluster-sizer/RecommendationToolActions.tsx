import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { RhUiCopyIcon } from "@patternfly/react-icons";
import React from "react";

interface RecommendationToolResultsActionsProps {
  isReadOnly: boolean;
  isEditDisabled: boolean;
  onEdit: () => void;
  canCopy: boolean;
  onCopy: () => void;
}

export const RecommendationToolActions: React.FC<
  RecommendationToolResultsActionsProps
> = ({ isReadOnly, isEditDisabled, onEdit, canCopy, onCopy }) => (
  <Flex gap={{ default: "gapMd" }} flexWrap={{ default: "wrap" }}>
    {!isReadOnly ? (
      <FlexItem>
        <Button
          variant="secondary"
          onClick={onEdit}
          isDisabled={isEditDisabled}
        >
          Edit migration preferences
        </Button>
      </FlexItem>
    ) : null}
    {canCopy ? (
      <FlexItem>
        <Button
          variant="link"
          icon={<RhUiCopyIcon />}
          iconPosition="end"
          onClick={onCopy}
        >
          Copy as plain text
        </Button>
      </FlexItem>
    ) : null}
  </Flex>
);

RecommendationToolActions.displayName = "RecommendationToolActions";

export default RecommendationToolActions;
