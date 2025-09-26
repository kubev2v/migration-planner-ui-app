import React, { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  AlertActionLink,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  StackItem,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { useDiscoverySources } from '../../migration-wizard/contexts/discovery-sources/Context';

import { DiscoverySourceSetupModal } from './sources-table/empty-state/DiscoverySourceSetupModal';
import { SourcesTable } from './sources-table/SourcesTable';
import { TroubleshootingModal } from './TroubleshootingModal';

export const Environment: React.FC = () => {
  const discoverySourcesContext = useDiscoverySources();

  const [
    shouldShowDiscoverySourceSetupModal,
    setShouldShowDiscoverySetupModal,
  ] = useState(false);

  const toggleDiscoverySourceSetupModal = useCallback((): void => {
    setShouldShowDiscoverySetupModal((lastState) => !lastState);
  }, []);
  const hasSources =
    discoverySourcesContext.sources &&
    discoverySourcesContext.sources.length > 0;
  const [firstSource, ..._otherSources] = discoverySourcesContext.sources ?? [];
  const sourceSelected =
    (discoverySourcesContext.sourceSelected &&
      discoverySourcesContext.sources?.find(
        (source) => source.id === discoverySourcesContext.sourceSelected?.id,
      )) ||
    firstSource;
  const [isOvaDownloading, setIsOvaDownloading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploadError, setIsUploadError] = useState(false);
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Multi-select status filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const toggleStatus = (statusKey: string): void => {
    setSelectedStatuses((prev) =>
      prev.includes(statusKey)
        ? prev.filter((s) => s !== statusKey)
        : [...prev, statusKey],
    );
  };

  const clearStatuses = (): void => setSelectedStatuses([]);

  const statusOptions: { key: string; label: string }[] = [
    { key: 'not-connected-uploaded', label: 'Uploaded manually' },
    { key: 'not-connected', label: 'Not connected' },
    { key: 'waiting-for-credentials', label: 'Waiting for credentials' },
    { key: 'gathering-initial-inventory', label: 'Gathering inventory' },
    { key: 'error', label: 'Error' },
    { key: 'up-to-date', label: 'Ready' },
  ];

  useEffect(() => {
    if (uploadMessage) {
      const timeout = setTimeout(() => {
        setUploadMessage(null);
      }, 5000); // dissapears after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [uploadMessage]);

  useEffect(() => {
    if (isOvaDownloading) {
      const timeout = setTimeout(() => {
        setIsOvaDownloading(false);
      }, 5000); // dissapears after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [isOvaDownloading]);

  return (
    <>
      <div
        style={{
          background: 'white',
          padding: '0 20px 20px 20px',
          marginTop: '10px',
          marginBottom: '10px',
        }}
      >
        <Toolbar inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarItem>
              <InputGroup>
                <InputGroupItem>
                  <Dropdown
                    isOpen={isFilterDropdownOpen}
                    onSelect={() => setIsFilterDropdownOpen(false)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() =>
                          setIsFilterDropdownOpen(!isFilterDropdownOpen)
                        }
                        isExpanded={isFilterDropdownOpen}
                        style={{ minWidth: '220px', width: '220px' }}
                      >
                        <FilterIcon style={{ marginRight: '8px' }} />
                        Filters
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem isDisabled key="heading-status">
                        Discovery VM Status
                      </DropdownItem>
                      <DropdownItem
                        key="status-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearStatuses();
                        }}
                      >
                        All statuses
                      </DropdownItem>
                      {statusOptions.map((opt) => (
                        <DropdownItem
                          key={`status-${opt.key}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleStatus(opt.key);
                          }}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={selectedStatuses.includes(opt.key)}
                            style={{ marginRight: '8px' }}
                          />
                          {opt.label}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <SearchInput
                    id="environment-search"
                    aria-label="Search by name"
                    placeholder="Search by name"
                    value={search}
                    onChange={(_event, value) => setSearch(value)}
                    onClear={() => setSearch('')}
                    style={{ minWidth: '300px', width: '300px' }}
                  />
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem>
              {hasSources ? (
                <Button
                  variant="primary"
                  onClick={toggleDiscoverySourceSetupModal}
                  icon={<PlusCircleIcon />}
                >
                  Add environment
                </Button>
              ) : null}
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <div style={{ marginTop: '10px' }}>
          <SourcesTable
            onUploadResult={(message, isError) => {
              setUploadMessage(message);
              setIsUploadError(isError ?? false);
            }}
            onUploadSuccess={async () => {
              await discoverySourcesContext.listSources();
            }}
            search={search}
            selectedStatuses={selectedStatuses}
          />
        </div>
      </div>

      {isOvaDownloading && (
        <StackItem>
          <Alert isInline variant="info" title="Download OVA image">
            The OVA image is downloading
          </Alert>
        </StackItem>
      )}

      {discoverySourcesContext.errorDownloadingSource && (
        <StackItem>
          <Alert isInline variant="danger" title="Download Environment error">
            {discoverySourcesContext.errorDownloadingSource.message}
          </Alert>
        </StackItem>
      )}

      {sourceSelected?.agent &&
        sourceSelected?.agent.status === 'waiting-for-credentials' && (
          <StackItem>
            <Alert
              isInline
              variant="custom"
              title="Discovery VM"
              actionLinks={
                <AlertActionLink
                  component="a"
                  href={sourceSelected?.agent.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sourceSelected?.agent.credentialUrl}
                </AlertActionLink>
              }
            >
              <TextContent>
                <Text>
                  Click the link below to connect the Discovery Source to your
                  VMware environment.
                </Text>
              </TextContent>
            </Alert>
          </StackItem>
        )}

      {uploadMessage && (
        <StackItem>
          <Alert
            isInline
            variant={isUploadError ? 'danger' : 'success'}
            title={isUploadError ? 'Upload error' : 'Upload success'}
          >
            {uploadMessage}
          </Alert>
        </StackItem>
      )}

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
      <TroubleshootingModal
        isOpen={isTroubleshootingOpen}
        onClose={() => setIsTroubleshootingOpen(false)}
      />
    </>
  );
};

Environment.displayName = 'Environment';
