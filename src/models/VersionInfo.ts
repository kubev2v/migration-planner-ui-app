export interface VersionInfo {
  ui: {
    name: string;
    versionName: string;
    gitCommit: string;
  };
  api: {
    name: string;
    versionName: string;
    gitCommit: string;
  };
  agent: {
    versionName: string;
    gitCommit: string;
  };
}
