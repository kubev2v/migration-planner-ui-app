import { useChrome } from "@redhat-cloud-services/frontend-components/useChrome";
import { useCallback, useMemo } from "react";

import { getChatBaseUrl } from "../helpers";

export const useChatAuth = () => {
  const chrome = useChrome();
  const chatBaseUrl = useMemo(() => getChatBaseUrl(), []);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const token = await chrome.auth.getToken();
      return fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },
    [chrome.auth],
  );

  return { authFetch, chatBaseUrl };
};
