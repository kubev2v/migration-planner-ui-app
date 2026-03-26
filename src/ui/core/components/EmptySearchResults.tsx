import { EmptyState, EmptyStateBody } from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import React from "react";

export interface EmptySearchResultsProps {
  title?: string;
  body?: string;
}

export const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  title = "No results found",
  body = "No results were found for your search. Try modifying your filters or search criteria to see more options",
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
