import { useEffect, useState } from "react";

import { useEnvironmentPage } from "../view-models/EnvironmentPageContext";

export interface UseSourceDownloadParams {
  isOpen: boolean;
  providedUrl?: string;
  sourceId?: string;
}

export interface UseSourceDownloadResult {
  downloadUrl: string;
  isLoading: boolean;
  startDownload: (
    sourceName: string,
    onStart?: () => void,
    onAfter?: () => Promise<void>,
  ) => void;
}

export const useSourceDownload = ({
  isOpen,
  providedUrl,
  sourceId,
}: UseSourceDownloadParams): UseSourceDownloadResult => {
  const vm = useEnvironmentPage();
  const [fetchedUrl, setFetchedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getCurrentUrl = (): string => {
    if (providedUrl) return providedUrl;
    if (sourceId) {
      return vm.getDownloadUrlForSource?.(sourceId) || "";
    }
    return "";
  };

  const needsFetch =
    isOpen &&
    !providedUrl &&
    sourceId &&
    !vm.getDownloadUrlForSource?.(sourceId);

  useEffect(() => {
    if (!needsFetch) {
      return;
    }

    let cancelled = false;

    const fetchUrl = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const url = await vm.fetchDownloadUrlForSource?.(sourceId);
        if (!cancelled) {
          setFetchedUrl(url || "");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch download URL:", error);
        if (!cancelled) {
          setFetchedUrl("");
          setIsLoading(false);
        }
      }
    };
    void fetchUrl();

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [needsFetch, sourceId, vm]);

  const downloadUrl = getCurrentUrl() || fetchedUrl;

  const startDownload = (
    sourceName: string,
    onStart?: () => void,
    onAfter?: () => Promise<void>,
  ): void => {
    if (!downloadUrl) return;
    onStart?.();
    const anchor = document.createElement("a");
    anchor.download = `${sourceName}.ova`;
    anchor.href = downloadUrl;
    anchor.click();
    anchor.remove();
    void onAfter?.();
  };

  return {
    downloadUrl,
    isLoading,
    startDownload,
  };
};
