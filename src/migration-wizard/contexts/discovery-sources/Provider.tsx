import React, { type PropsWithChildren, useCallback, useState } from 'react';
import { useAsyncFn, useInterval } from 'react-use';
import {
  type AgentApiInterface,
  type SourceApiInterface,
} from '@migration-planner-ui/api-client/apis';
import { useInjection } from '@migration-planner-ui/ioc';
import { Symbols } from '../../../main/Symbols';
import { Context } from './Context';
import {
  Agent,
  Source,
  SourceUpdateOnPremFromJSON,
} from '@migration-planner-ui/api-client/models';
import { useAccountsAccessToken } from '../../../hooks/useAccountsAccessToken';

export const Provider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { accessToken } = useAccountsAccessToken();
  const [sourceSelected, setSourceSelected] = useState<Source | null>(null);

  const [agentSelected, setAgentSelected] = useState<Agent | null>(null);

  const [sourcesLoaded, setSourcesLoaded] = useState(false);

  const sourceApi = useInjection<SourceApiInterface>(Symbols.SourceApi);
  const agentsApi = useInjection<AgentApiInterface>(Symbols.AgentApi);

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
    async (name: string, sshPublicKey: string) => {
      //TODO: Remove the proxy
      try {
        return await sourceApi.createSource(
          {
            sourceCreate: {
              name,
              sshPublicKey,
              proxy: { httpsUrl: 'http://squid.corp.redhat.com:3128' },
            },
          },
          {
            headers: {
              'Content-type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
  
      } catch (error: unknown) {
        console.error("Error creating source:", error);
  
        if (typeof error === "object" && error !== null && "response" in error) {
          const response = (error as { response: Response }).response;
  
          try {
            const errorText = await response.text(); // Read as text first
            try {
              const errorData = JSON.parse(errorText); // Attempt to parse JSON
              return errorData?.message || "API error occurred.";
            } catch {
              return errorText || "Failed to parse API error response.";
            }
          } catch {
            return "Error response could not be read.";
          }
        }
  
        return "Unexpected error occurred while creating the source.";
      }
    },
  );

  const [downloadSourceState, downloadSource] = useAsyncFn(
    async (sourceName: string, sourceSshKey: string): Promise<void> => {
      const anchor = document.createElement('a');
      anchor.download = sourceName + '.ova';

      const newSource = await createSource(sourceName, sourceSshKey);
      const imageUrl = `https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com/planner/api/v1/sources/${newSource.id}/image`;
      const imageUrlGen = `https://migration-planner-assisted-migration-stage.apps.crcs02ue1.urby.p1.openshiftapps.com/planner/api/v1/sources/${newSource.id}/image-url`;

      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use access token here
        },
      });

      if (!response.ok) {
        const error: Error = new Error(
          `Error downloading source: ${response.status} ${response.statusText}`,
        );
        downloadSourceState.error = error;
        console.error('Error downloading source:', error);
        throw error;
      } else {
        downloadSourceState.loading = true;
      }

      const responseGen = await fetch(imageUrlGen, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use access token here
        },
      });

      if (!responseGen.ok) {
        const error: Error = new Error(
          `Error downloading source: ${responseGen.status} ${responseGen.statusText}`,
        );
        downloadSourceState.error = error;
        console.error('Error downloading source:', error);
        throw error;
      } else {
        downloadSourceState.loading = true;
      }

      const responseGenJson = await responseGen.json();
      anchor.href = responseGenJson.url;
      anchor.click();
      anchor.remove();
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
    async (sourceId: string, jsonValue: string) => {
      console.log(jsonValue);
      const updatedSource = sourceApi.updateSource({
        id: sourceId,
        sourceUpdateOnPrem: SourceUpdateOnPremFromJSON(jsonValue),
      });
      return updatedSource;
    },
  );

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
    downloadSource,
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
  };

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

Provider.displayName = 'DiscoverySourcesProvider';
