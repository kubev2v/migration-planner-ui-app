import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMount, useUnmount } from 'react-use';

import { Source } from '@migration-planner-ui/api-client/models';
import { Button, Spinner } from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useDiscoverySources } from '../../../migration-wizard/contexts/discovery-sources/Context';

import { RemoveSourceAction } from './actions/RemoveSourceAction';
import { UploadInventoryAction } from './actions/UploadInventoryAction';
import { EmptyState } from './empty-state/EmptyState';
import { AgentStatusView } from './AgentStatusView';
import { Columns } from './Columns';
import { DEFAULT_POLLING_DELAY, VALUE_NOT_AVAILABLE } from './Constants';

type SourceTableProps = {
  onUploadResult?: (message: string, isError?: boolean) => void;
  onUploadSuccess?: () => void;
  search?: string;
  filterBy?: string;
  filterValue?: string;
};

export const SourcesTable: React.FC<SourceTableProps> = ({
  onUploadResult,
  onUploadSuccess,
  search: _search = '',
  filterBy = 'Filter',
  filterValue = '',
}) => {
  const discoverySourcesContext = useDiscoverySources();
  const prevSourcesRef = useRef<typeof discoverySourcesContext.sources>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memorize ordered agents without mutating context sources
  const memoizedSources = useMemo(() => {
    const areSourcesEquals = (
      prevSources: typeof discoverySourcesContext.sources,
      newSources: typeof discoverySourcesContext.sources,
    ): boolean => {
      if (
        !prevSources ||
        !newSources ||
        prevSources.length !== newSources.length
      )
        return false;
      return prevSources.every(
        (agent, index) => agent.id === newSources[index].id,
      );
    };

    const sourcesToUse: Source[] = discoverySourcesContext.sources
      ? [...discoverySourcesContext.sources].sort((a: Source, b: Source) =>
          a.id.localeCompare(b.id),
        )
      : [];

    if (!areSourcesEquals(prevSourcesRef.current, sourcesToUse)) {
      prevSourcesRef.current = sourcesToUse;
    }

    return prevSourcesRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoverySourcesContext.sources]);

  const [firstSource, ..._otherSources] = memoizedSources ?? [];
  const hasSources = memoizedSources && memoizedSources.length > 0;

  const filteredSources = useMemo(() => {
    if (!memoizedSources) return [];
    let filtered = memoizedSources;

    if (filterBy === 'Status' && filterValue.trim() !== '') {
      const normalizedFilter = filterValue.toLowerCase();
      filtered = memoizedSources.filter((source) => {
        const status = source.agent ? source.agent.status : 'not-connected';
        return status.toLowerCase().includes(normalizedFilter);
      });
    }

    return filtered;
  }, [memoizedSources, filterBy, filterValue]);

  useMount(async () => {
    discoverySourcesContext.startPolling(DEFAULT_POLLING_DELAY);
    if (!discoverySourcesContext.isPolling) {
      await Promise.all([discoverySourcesContext.listSources()]);
    }
  });

  useUnmount(() => {
    discoverySourcesContext.stopPolling();
  });

  useEffect(
    () => {
      if (!discoverySourcesContext.sourceSelected && firstSource) {
        discoverySourcesContext.selectSource(firstSource);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstSource, discoverySourcesContext],
  );

  useEffect(() => {
    // Use timeout to verify memoizedSources variable
    timeoutRef.current = setTimeout(() => {
      if (memoizedSources && memoizedSources.length === 0) {
        setIsLoading(false);
      }
    }, 3000); // Timeout in milisecons (3 seconds here)

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => {
      // Clean the timeout in case unmount the component
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [memoizedSources]);

  // Show spinner until all data is loaded
  if (isLoading && !hasSources) {
    return (
      <Table aria-label="Loading table" variant="compact" borders={false}>
        <Tbody>
          <Tr>
            <Td colSpan={7}>
              <Spinner size="xl" />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    );
  } else {
    return (
      <div>
        {discoverySourcesContext.assessmentFromAgentState && (
          <div style={{ marginBottom: '16px' }}>
            <Button variant="link" icon={<ArrowLeftIcon />} onClick={() => {}}>
              Back to Assessments
            </Button>
          </div>
        )}
        <div
          style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'auto' }}
        >
          <Table aria-label="Sources table" variant="compact" borders={false}>
            {filteredSources && filteredSources.length > 0 && (
              <Thead>
                <Tr>
                  <Th style={{ whiteSpace: 'normal' }}>{Columns.Name}</Th>
                  <Th style={{ whiteSpace: 'normal' }}>{Columns.Status}</Th>
                  <Th style={{ whiteSpace: 'normal' }}>{Columns.Hosts}</Th>
                  <Th style={{ whiteSpace: 'normal' }}>{Columns.VMs}</Th>
                  <Th
                    style={{
                      whiteSpace: 'normal',
                      minWidth: '120px',
                      maxWidth: '200px',
                    }}
                  >
                    {Columns.Networks}
                  </Th>
                  <Th
                    style={{
                      whiteSpace: 'normal',
                      minWidth: '120px',
                      maxWidth: '200px',
                    }}
                  >
                    {Columns.Datastores}
                  </Th>
                  <Th
                    style={{
                      whiteSpace: 'normal',
                      minWidth: '120px',
                      maxWidth: '200px',
                    }}
                    screenReaderText="Actions"
                  >
                    {Columns.Actions}
                  </Th>
                </Tr>
              </Thead>
            )}
            <Tbody>
              {filteredSources && filteredSources.length > 0 ? (
                filteredSources.map((source) => {
                  // Get the agent related to this source
                  const agent = source.agent;
                  return (
                    <Tr key={source.id}>
                      <Td dataLabel={Columns.Name}>{source.name}</Td>
                      <Td dataLabel={Columns.Status}>
                        <AgentStatusView
                          status={agent ? agent.status : 'not-connected'}
                          statusInfo={
                            agent ? agent.statusInfo : 'Not connected'
                          }
                          credentialUrl={agent ? agent.credentialUrl : ''}
                          uploadedManually={
                            source?.onPremises &&
                            source?.inventory !== undefined
                          }
                        />
                      </Td>
                      <Td dataLabel={Columns.Hosts}>
                        {source?.inventory?.infra.totalHosts ??
                          VALUE_NOT_AVAILABLE}
                      </Td>
                      <Td dataLabel={Columns.VMs}>
                        {source?.inventory?.vms.total ?? VALUE_NOT_AVAILABLE}
                      </Td>
                      <Td dataLabel={Columns.Networks}>
                        {source?.inventory?.infra.networks?.length ??
                          VALUE_NOT_AVAILABLE}
                      </Td>
                      <Td dataLabel={Columns.Datastores}>
                        {source?.inventory?.infra.datastores?.length ??
                          VALUE_NOT_AVAILABLE}
                      </Td>
                      <Td dataLabel={Columns.Actions}>
                        <>
                          {source.name !== 'Example' && (
                            <RemoveSourceAction
                              sourceId={source.id}
                              sourceName={source.name}
                              isDisabled={
                                discoverySourcesContext.isDeletingSource
                              }
                              onConfirm={async (event) => {
                                event.stopPropagation();
                                await discoverySourcesContext.deleteSource(
                                  source.id,
                                );
                                event.dismissConfirmationModal();
                                await Promise.all([
                                  discoverySourcesContext.listSources(),
                                  firstSource &&
                                    discoverySourcesContext.selectSource(
                                      firstSource,
                                    ),
                                ]);
                              }}
                            />
                          )}
                          {(!source?.agent || source?.onPremises) &&
                            source?.name !== 'Example' && (
                              <UploadInventoryAction
                                sourceId={source.id}
                                discoverySourcesContext={
                                  discoverySourcesContext
                                }
                                onUploadResult={(message, isError) => {
                                  onUploadResult?.(message, isError);
                                }}
                                onUploadSuccess={onUploadSuccess}
                              />
                            )}
                          {/* Temporarily disabled: Download OVA action. Re-enable when needed.
                          {source.name !== 'Example' && (
                            <DownloadOvaAction
                              sourceId={source.id}
                              sourceName={source.name}
                            />
                          )}
                          */}
                        </>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={12}>
                    <EmptyState />
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>
      </div>
    );
  }
};
