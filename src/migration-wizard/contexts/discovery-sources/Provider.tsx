import React, { type PropsWithChildren, useCallback, useState } from 'react';
import { useAsyncFn, useInterval } from 'react-use';
import {
  type ImageApiInterface,
  type AgentApiInterface,
  type SourceApiInterface,
} from '@migration-planner-ui/api-client/apis';
import { useInjection } from '@migration-planner-ui/ioc';
import { Symbols } from '../../../main/Symbols';
import { Context } from './Context';
import {
  Agent,
  InventoryFromJSON,
  Source,
  SourceUpdateFromJSON,
  SourceUpdateOnPremFromJSON,
} from '@migration-planner-ui/api-client/models';

export const Provider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [sourceSelected, setSourceSelected] = useState<Source | null>(null);

  const [agentSelected, setAgentSelected] = useState<Agent | null>(null);

  const [sourcesLoaded, setSourcesLoaded] = useState(false);

  const [downloadSourceUrl, setDownloadSourceUrl] = useState('');

  const sourceApi = useInjection<SourceApiInterface>(Symbols.SourceApi);
  const agentsApi = useInjection<AgentApiInterface>(Symbols.AgentApi);
  const imageApi = useInjection<ImageApiInterface>(Symbols.ImageApi);

  const [listAgentsState, listAgents] = useAsyncFn(async () => {
    if (!sourcesLoaded) return;
    const agents = await agentsApi.listAgents();
    return agents;
  }, [sourcesLoaded]);

  const [listSourcesState, listSources] = useAsyncFn(async () => {
    const sources = await sourceApi.listSources({ includeDefault: true });
    setSourcesLoaded(true);
    return sources;
  });

  const [deleteSourceState, deleteSource] = useAsyncFn(async (id: string) => {
    const deletedSource = await sourceApi.deleteSource({ id });
    return deletedSource;
  });

  const [createSourceState, createSource] = useAsyncFn(
    async (
      name: string,
      sshPublicKey: string,
      httpProxy: string,
      httpsProxy: string,
      noProxy: string,
    ) => {
      try {
        // Build the sourceCreate object conditionally
        const sourceCreate: any = { name };

        // Only include sshPublicKey if it has a value
        if (sshPublicKey && sshPublicKey.trim()) {
          sourceCreate.sshPublicKey = sshPublicKey;
        }

        // Only include proxy if at least one proxy field has a value
        const proxyFields: any = {};
        if (httpProxy && httpProxy.trim()) {
          proxyFields.httpUrl = httpProxy;
        }
        if (httpsProxy && httpsProxy.trim()) {
          proxyFields.httpsUrl = httpsProxy;
        }
        if (noProxy && noProxy.trim()) {
          proxyFields.noProxy = noProxy;
        }

        // Only add proxy object if it has at least one field
        if (Object.keys(proxyFields).length > 0) {
          sourceCreate.proxy = proxyFields;
        }

        return await sourceApi.createSource({ sourceCreate });
      } catch (error: unknown) {
        console.error('Error creating source:', error);

        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error
        ) {
          const response = (error as { response: Response }).response;

          try {
            const errorText = await response.text(); // Read as text first
            try {
              const errorData = JSON.parse(errorText); // Attempt to parse JSON
              return errorData?.message || 'API error occurred.';
            } catch {
              return errorText || 'Failed to parse API error response.';
            }
          } catch {
            return 'Error response could not be read.';
          }
        }

        return 'Unexpected error occurred while creating the source.';
      }
    },
  );

  const [downloadSourceState, createDownloadSource] = useAsyncFn(
    async (
      sourceName: string,
      sourceSshKey: string,
      httpProxy: string,
      httpsProxy: string,
      noProxy: string,
    ): Promise<void> => {
      const newSource = await createSource(
        sourceName,
        sourceSshKey,
        httpProxy,
        httpsProxy,
        noProxy,
      );

      if (!newSource?.id) {
        throw new Error(
          `Failed to create source. Response: ${JSON.stringify(
            newSource,
            null,
            2,
          )}`,
        );
      }

      await imageApi.headImage({ id: newSource.id });
      const imageUrl = await imageApi.getSourceDownloadURL({
        id: newSource.id,
      });
      downloadSourceState.loading = true;

      setDownloadSourceUrl(imageUrl.url);
    },
  );

  const [isPolling, setIsPolling] = useState(false);
  const [pollingDelay, setPollingDelay] = useState<number | null>(null);
  const startPolling = useCallback(
    (delay: number) => {
      if (!isPolling) {
        setPollingDelay(delay);
        setIsPolling(true);
      }
    },
    [isPolling],
  );
  const stopPolling = useCallback(() => {
    if (isPolling) {
      setPollingDelay(null);
      setIsPolling(false);
    }
  }, [isPolling]);

  useInterval(() => {
    if (!listSourcesState.loading) {
      listSources();
    }
  }, pollingDelay);

  const selectSource = useCallback((source: Source | null) => {
    setSourceSelected(source);
  }, []);

  const selectSourceById = useCallback(
    (sourceId: string) => {
      if (!listSourcesState.loading) {
        const source = listSourcesState.value?.find(
          (source) => source.id === sourceId,
        );
        setSourceSelected(source || null);
      } else {
        listSources().then((_sources) => {
          const source = _sources.find((source) => source.id === sourceId);
          setSourceSelected(source || null);
        });
      }
    },
    [listSources, listSourcesState],
  );

  const selectAgent = useCallback(async (agent: Agent) => {
    setAgentSelected(agent);
  }, []);

  const [deleteAgentState, deleteAgent] = useAsyncFn(async (agent: Agent) => {
    const deletedAgent = await agentsApi.deleteAgent({ id: agent.id });
    return deletedAgent;
  });

  const getSourceById = useCallback(
    (sourceId: string) => {
      const source = listSourcesState.value?.find(
        (source) => source.id === sourceId,
      );
      return source;
    },
    [listSourcesState.value],
  );

  const [updateSourceState, updateSource] = useAsyncFn(
    async (sourceId: string, agentId: string, jsonValue: string) => {
      const updatedSource = sourceApi.updateInventory({
        id: sourceId,
        updateInventory: {
          agentId: agentId,
          inventory: InventoryFromJSON(jsonValue),
        },
      });
      return updatedSource;
    },
  );

  const setDownloadUrl = useCallback((url: string) => {
    setDownloadSourceUrl('');
  }, []);

  const ctx: DiscoverySources.Context = {
    sources: listSourcesState.value ?? [],
    isLoadingSources: listSourcesState.loading,
    errorLoadingSources: listSourcesState.error,
    isDeletingSource: deleteSourceState.loading,
    errorDeletingSource: deleteSourceState.error,
    isCreatingSource: createSourceState.loading,
    errorCreatingSource: createSourceState.error,
    isDownloadingSource: downloadSourceState.loading,
    errorDownloadingSource: downloadSourceState.error,
    isPolling,
    listSources,
    deleteSource,
    createDownloadSource,
    startPolling,
    stopPolling,
    sourceSelected: sourceSelected,
    selectSource,
    agents: listAgentsState.value ?? [],
    isLoadingAgents: listAgentsState.loading,
    errorLoadingAgents: listAgentsState.error,
    listAgents,
    deleteAgent,
    isDeletingAgent: deleteAgentState.loading,
    errorDeletingAgent: deleteAgentState.error,
    selectAgent,
    agentSelected: agentSelected,
    selectSourceById,
    getSourceById,
    updateSource,
    isUpdatingSource: updateSourceState.loading,
    errorUpdatingSource: updateSourceState.error,
    downloadSourceUrl,
    setDownloadUrl,
  };

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

Provider.displayName = 'DiscoverySourcesProvider';
