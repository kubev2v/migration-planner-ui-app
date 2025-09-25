import React, { useCallback, useEffect, useState } from 'react';

import { Source } from '@migration-planner-ui/api-client/models';
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
  StackItem,
  Text,
  TextContent,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  FilterIcon,
  PlusCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';

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
  const [sourceSelected, setSourceSelected] = useState<Source>();
  const [isOvaDownloading, setIsOvaDownloading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploadError, setIsUploadError] = useState(false);
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterBy, setFilterBy] = useState('Filter');

  useEffect(() => {
    if (discoverySourcesContext.sourceSelected) {
      const foundSource = discoverySourcesContext.sources.find(
        (source) => source.id === discoverySourcesContext.sourceSelected?.id,
      );
      if (foundSource) {
        setSourceSelected(foundSource);
      } else {
        if (firstSource) {
          setSourceSelected(firstSource);
        } else {
          setSourceSelected(undefined);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoverySourcesContext.sources, firstSource]);

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
                        style={{ minWidth: '180px', width: '180px' }}
                      >
                        <FilterIcon style={{ marginRight: '8px' }} />
                        {filterBy}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="sourceType"
                        onClick={() => setFilterBy('Discovery VM Status')}
                      >
                        Discovery VM Status
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </InputGroupItem>
                <InputGroupItem>
                  <Button variant="control" aria-label="Search">
                    <SearchIcon />
                  </Button>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <TextInput
                    name="environment-search"
                    id="environment-search"
                    type="search"
                    placeholder="Search"
                    style={{ minWidth: '300px', width: '300px' }}
                    value={search}
                    onChange={(_event, value) => setSearch(value)}
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
            filterBy={filterBy}
            filterValue={search}
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
            title={uploadMessage}
          />
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
