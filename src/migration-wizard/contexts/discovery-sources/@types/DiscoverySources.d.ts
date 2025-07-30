declare namespace DiscoverySources {
  type Context = {
    sources: Source[];
    isLoadingSources: boolean;
    errorLoadingSources?: Error;
    isDeletingSource: boolean;
    errorDeletingSource?: Error;
    isDownloadingSource: boolean;
    errorDownloadingSource?: Error;
    isCreatingSource: boolean;
    errorCreatingSource?: Error;
    isPolling: boolean;
    sourceSelected: Source;
    listSources: () => Promise<Source[]>;
    deleteSource: (id: string) => Promise<Source>;
    createDownloadSource: (
      envName: string,
      sourceSshKey: string,
      httpProxy: string,
      httpsProxy: string,
      noProxy: string,
    ) => Promise<void>;
    startPolling: (delay: number) => void;
    stopPolling: () => void;
    selectSource: (source: Source) => void;
    agents: Agent[] | undefined;
    isLoadingAgents: boolean;
    errorLoadingAgents?: Error;
    listAgents: () => Promise<Agent[] | undefined>;
    deleteAgent: (agent: Agent) => Promise<Agent>;
    isDeletingAgent: boolean;
    errorDeletingAgent?: Error;
    selectAgent: (agent: Agent) => void;
    agentSelected: Agent;
    selectSourceById: (sourceId: string) => void;
    getSourceById: (sourceId: string) => Source;
    updateSource: (
      sourceId: string,
      agentId: string,
      jsonValue: string,
    ) => void;
    isUpdatingSource: boolean;
    errorUpdatingSource?: Error;
    downloadSourceUrl?: string;
    setDownloadUrl?: (url: string) => void;
  };
}
