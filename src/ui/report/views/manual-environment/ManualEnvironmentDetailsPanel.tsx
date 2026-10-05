import {
  Alert,
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { RhUiClusterIcon } from "@patternfly/react-icons";
import React from "react";

import {
  DETAILS_DESCRIPTION,
  DETAILS_HEADING,
  EMPTY_BODY,
  EMPTY_TITLE,
} from "../../manual-environment/constants";
import { useManualEnvironmentDetailsViewModel } from "../../view-models/useManualEnvironmentDetailsViewModel";
import { ManualEnvironmentSummary } from "./ManualEnvironmentSummary";
import { emptyStatePanel, titleRow } from "./styles";

export const ManualEnvironmentDetailsPanel: React.FC = () => {
  const vm = useManualEnvironmentDetailsViewModel();

  let body: React.ReactNode;
  if (vm.isLoading) {
    body = (
      <Spinner size="lg" aria-label="Loading manual environment details" />
    );
  } else if (vm.error) {
    body = (
      <Alert
        variant="danger"
        isInline
        title="Could not load manual environment details"
      >
        <Stack hasGutter>
          <StackItem>{vm.error.message}</StackItem>
          <StackItem>
            <Button variant="secondary" onClick={vm.reload}>
              Try again
            </Button>
          </StackItem>
        </Stack>
      </Alert>
    );
  } else if (!vm.hasSavedDetails) {
    body = (
      <div className={emptyStatePanel}>
        <EmptyState
          headingLevel="h3"
          icon={RhUiClusterIcon}
          titleText={EMPTY_TITLE}
          variant="lg"
        >
          <EmptyStateBody>{EMPTY_BODY}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" onClick={vm.openWizard}>
                Add manual details
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </div>
    );
  } else {
    body = <ManualEnvironmentSummary summary={vm.summary} />;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <div className={titleRow}>
          <Content component={ContentVariants.h2}>{DETAILS_HEADING}</Content>
          {!vm.isLoading && !vm.error && vm.hasSavedDetails ? (
            <Button variant="secondary" onClick={vm.openWizard}>
              Edit details
            </Button>
          ) : null}
        </div>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p}>{DETAILS_DESCRIPTION}</Content>
      </StackItem>
      <StackItem>{body}</StackItem>
    </Stack>
  );
};

ManualEnvironmentDetailsPanel.displayName = "ManualEnvironmentDetailsPanel";
