import {
  Button,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { AngleLeftIcon, RhUiCopyIcon } from "@patternfly/react-icons";
import type { ReactNode } from "react";
import React from "react";

import {
  toolViewHeaderStyle,
  toolViewTitleStyle,
} from "../migration-recommendations/styles";

interface RecommendationToolLayoutProps {
  title: string;
  onBack: () => void;
  help?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export const RecommendationToolLayout: React.FC<
  RecommendationToolLayoutProps
> = ({ title, onBack, help, actions, children }) => (
  <Stack>
    <StackItem className={toolViewHeaderStyle}>
      <Button variant="link" isInline icon={<AngleLeftIcon />} onClick={onBack}>
        Back to recommendation tools
      </Button>
      <Flex
        className={toolViewTitleStyle}
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignItems={{ default: "alignItemsCenter" }}
        flexWrap={{ default: "wrap" }}
        gap={{ default: "gapMd" }}
      >
        <FlexItem>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            flexWrap={{ default: "nowrap" }}
            gap={{ default: "gapSm" }}
          >
            <FlexItem>
              <Title headingLevel="h2">{title}</Title>
            </FlexItem>
            {help ? <FlexItem>{help}</FlexItem> : null}
          </Flex>
        </FlexItem>
        {actions ? <FlexItem>{actions}</FlexItem> : null}
      </Flex>
    </StackItem>
    <StackItem>{children}</StackItem>
  </Stack>
);

interface RecommendationToolResultsActionsProps {
  isReadOnly: boolean;
  isEditDisabled: boolean;
  onEdit: () => void;
  canCopy: boolean;
  onCopy: () => void;
}

export const RecommendationToolResultsActions: React.FC<
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

RecommendationToolResultsActions.displayName =
  "RecommendationToolResultsActions";
RecommendationToolLayout.displayName = "RecommendationToolLayout";

export default RecommendationToolLayout;
