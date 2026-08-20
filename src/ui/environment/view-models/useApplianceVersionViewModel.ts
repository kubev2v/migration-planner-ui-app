import { useInjection } from "@openshift-migration-advisor/ioc";
import { useSyncExternalStore } from "react";
import { useAsync } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IVersionsStore } from "../../../data/stores/interfaces/IVersionsStore";
import { OVA_RELEASE_NOTES_URL } from "../constants";

export interface ApplianceVersionViewModel {
  displayVersion: string;
  isLoading: boolean;
  releaseNotesUrl: string;
}

export const useApplianceVersionViewModel = (): ApplianceVersionViewModel => {
  const versionsStore = useInjection<IVersionsStore>(Symbols.VersionsStore);
  const versionInfo = useSyncExternalStore(
    versionsStore.subscribe.bind(versionsStore),
    versionsStore.getSnapshot.bind(versionsStore),
  );

  const { loading } = useAsync(
    () => versionsStore.getApiVersionInfo(),
    [versionsStore],
  );

  return {
    displayVersion: versionInfo.agent.versionName || "Unknown",
    isLoading: loading,
    releaseNotesUrl: OVA_RELEASE_NOTES_URL,
  };
};
