import {
  Alert,
  Button,
  EmptyState as PFEmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  StackItem,
} from "@patternfly/react-core";
import { ExclamationCircleIcon, SearchIcon } from "@patternfly/react-icons";
import React, { useCallback } from "react";

import { useEnvironmentPage } from "../view-models/EnvironmentPageContext";

export interface EmptyStateProps {
  onAddEnvironment: () => void;
  isOvaDownloading: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddEnvironment,
  isOvaDownloading,
}) => {
  const vm = useEnvironmentPage();

  const handleTryAgain = useCallback(() => {
    if (!vm.isLoadingSources) {
      void vm.listSources();
    }
  }, [vm]);

  let emptyStateNode: React.ReactNode = (
    <PFEmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText="No environments found"
      variant="sm"
    >
      <EmptyStateBody>
        Begin by adding an environment, then download and import the OVA file
        into your VMware environment.
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="secondary" onClick={onAddEnvironment}>
            Add environment
          </Button>
        </EmptyStateActions>
        <StackItem>
          {isOvaDownloading && (
            <Alert isInline variant="info" title="Download OVA image">
              The OVA image is downloading
            </Alert>
          )}
        </StackItem>
      </EmptyStateFooter>
    </PFEmptyState>
  );

  if (vm.errorLoadingSources) {
    emptyStateNode = (
      <PFEmptyState
        headingLevel="h4"
        icon={ExclamationCircleIcon}
        titleText="Something went wrong..."
        variant="sm"
      >
        <EmptyStateBody>
          An error occurred while attempting to detect existing discovery
          sources
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="link" onClick={handleTryAgain}>
              Try again
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </PFEmptyState>
    );
  }

  return emptyStateNode;
};

EmptyState.displayName = "SourcesTableEmptyState";
