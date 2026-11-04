import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { RhUiErrorFillIcon } from "@patternfly/react-icons";
import React, { useCallback } from "react";

import { useEnvironmentPage } from "../view-models/EnvironmentPageContext";

export const DiscoveryAppliancesErrorLoadingState: React.FC = () => {
  const vm = useEnvironmentPage();

  const handleTryAgain = useCallback(() => {
    if (!vm.isLoadingSources) {
      void vm.listSources();
    }
  }, [vm]);

  if (!vm.errorLoadingSources) {
    return null;
  }

  return (
    <EmptyState
      headingLevel="h4"
      icon={RhUiErrorFillIcon}
      titleText="Something went wrong..."
      variant="sm"
    >
      <EmptyStateBody>
        An error occurred while attempting to detect existing discovery sources
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={handleTryAgain}>
            Try again
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

DiscoveryAppliancesErrorLoadingState.displayName =
  "DiscoveryAppliancesErrorLoadingState";
