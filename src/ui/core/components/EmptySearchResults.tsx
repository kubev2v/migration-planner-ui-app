import { EmptyState, EmptyStateBody } from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import React from "react";

export interface EmptySearchResultsProps {
  title?: string;
  body?: string;
}

export const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  title = "No results found",
  body = "To continue, adjust your search or filters and try again",
}) => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText={title}
      variant="sm"
    >
      <EmptyStateBody>{body}</EmptyStateBody>
    </EmptyState>
  );
};

EmptySearchResults.displayName = "EmptySearchResults";
