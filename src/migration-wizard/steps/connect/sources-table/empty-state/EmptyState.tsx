import React, { useCallback, useState } from 'react';
import {
  Button,
  EmptyState as PFEmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  StackItem,
  Alert,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { global_danger_color_200 as globalDangerColor200 } from '@patternfly/react-tokens/dist/js/global_danger_color_200';
import { DiscoverySourceSetupModal } from './DiscoverySourceSetupModal';
import { useDiscoverySources } from '../../../../contexts/discovery-sources/Context';

export const EmptyState: React.FC = () => {
  const discoverySourcesContext = useDiscoverySources();

  const [
    shouldShowDiscoverySourceSetupModal,
    setShouldShowDiscoverySetupModal,
  ] = useState(false);

  const toggleDiscoverySourceSetupModal = useCallback((): void => {
    setShouldShowDiscoverySetupModal((lastState) => !lastState);
  }, []);

  const handleTryAgain = useCallback(() => {
    if (!discoverySourcesContext.isLoadingSources) {
      discoverySourcesContext.listSources();
    }
  }, [discoverySourcesContext]);

  const [isOvaDownloading, setIsOvaDownloading] = useState(false);

  let emptyStateNode: React.ReactNode = (
    <PFEmptyState variant="sm">
      <EmptyStateHeader
        titleText="No discovery environment found"
        headingLevel="h4"
        icon={<EmptyStateIcon icon={SearchIcon} />}
      />
      <EmptyStateBody>
        Begin by creating a discovery environment. Then download and import the
        OVA file into your VMware environment.
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="secondary" onClick={toggleDiscoverySourceSetupModal}>
            Create
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

  if (discoverySourcesContext.errorLoadingSources) {
    emptyStateNode = (
      <PFEmptyState variant="sm">
        <EmptyStateHeader
          titleText="Something went wrong..."
          headingLevel="h4"
          icon={
            <EmptyStateIcon
              icon={ExclamationCircleIcon}
              color={globalDangerColor200.value}
            />
          }
        />
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

  return (
    <>
      {emptyStateNode}
      {shouldShowDiscoverySourceSetupModal && (
        <DiscoverySourceSetupModal
          isOpen={shouldShowDiscoverySourceSetupModal}
          onClose={toggleDiscoverySourceSetupModal}
          isDisabled={discoverySourcesContext.isDownloadingSource}
          onStartDownload={() => setIsOvaDownloading(true)}
          onAfterDownload={async () => {
            await discoverySourcesContext.listSources();
          }}
        />
      )}
    </>
  );
};

EmptyState.displayName = 'SourcesTableEmptyState';
