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
    updateInventory: (sourceId: string, jsonValue: string) => void;
    isUpdatingInventory: boolean;
    errorUpdatingInventory?: Error;
    uploadRvtoolsFile: (sourceId: string, file: Blob) => Promise<void>;
    isUploadingRvtoolsFile: boolean;
    errorUploadingRvtoolsFile?: Error;
    downloadSourceUrl?: string;
    setDownloadUrl?: (url: string) => void;
    sourceCreatedId?: string;
    deleteSourceCreated: () => void;
    updateSource: (
      sourceId: string,
      sourceSshKey: string,
      httpProxy: string,
      httpsProxy: string,
      noProxy: string,
    ) => Promise<void>;
    isUpdatingSource: boolean;
    errorUpdatingSource?: Error;
    sourceDownloadUrls: Record<string, string>;
    getDownloadUrlForSource: (sourceId: string) => string | undefined;
    storeDownloadUrlForSource: (sourceId: string, downloadUrl: string) => void;
    assessments: Assessment[];
    isLoadingAssessments: boolean;
    errorLoadingAssessments?: Error;
    listAssessments: () => Promise<Assessment[]>;
    createAssessment: (
      sourceId: string,
      sourceType: string,
      name?: string,
    ) => Promise<Assessment>;
    isCreatingAssessment: boolean;
    errorCreatingAssessment?: Error;
  };
}
