import type { Conversation } from "@patternfly/chatbot";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "../helpers";
import { useChatAuth } from "../hooks/useChatAuth";
import type { ConversationListResponse } from "../types";

export interface ChatBotHistoryViewModelInput {
  isOpen: boolean;
  conversationId?: string;
  startNewConversation: (closeDrawer?: boolean) => void;
}

export interface ChatBotHistoryViewModel {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | undefined;
  deleteConversationId: string | undefined;
  conversationToDelete: Conversation | undefined;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
}

const parseDeleteError = async (resp: Response): Promise<string> => {
  let errMsg = `Delete failed: ${resp.status}`;
  try {
    const errData = (await resp.json()) as {
      detail?: { cause?: string };
    };
    if (errData.detail?.cause) {
      errMsg = errData.detail.cause;
    }
  } catch {
    // Use default error
  }
  return errMsg;
};

const validateDeleteResponse = async (resp: Response): Promise<void> => {
  if (resp.status !== 204) {
    const contentType = resp.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const result = (await resp.json()) as {
        success?: boolean;
        response?: string;
      };
      if (result.success === false) {
        throw new Error(result.response || "Delete failed");
      }
    }
  }
};

export const useChatBotHistoryViewModel = ({
  isOpen,
  conversationId,
  startNewConversation,
}: ChatBotHistoryViewModelInput): ChatBotHistoryViewModel => {
  const { authFetch, chatBaseUrl } = useChatAuth();
  const [deleteConversationId, setDeleteConversationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>();

  const fetchConversations = useCallback(
    async (signal?: AbortSignal) => {
      const resp = await authFetch(`${chatBaseUrl}/v1/conversations`, {
        signal,
      });
      if (!resp.ok) {
        throw new Error(`Failed to load conversations: ${resp.status}`);
      }
      const data = (await resp.json()) as ConversationListResponse;
      setConversations(
        data.conversations
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
          .map(({ conversation_id, created_at }) => ({
            id: conversation_id,
            text: new Date(created_at).toLocaleString(),
          })),
      );
    },
    [authFetch, chatBaseUrl],
  );

  useEffect(() => {
    if (!isOpen) return;

    const abortController = new AbortController();
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        await fetchConversations(abortController.signal);
      } catch (e) {
        if (abortController.signal.aborted || cancelled) return;
        setError(getErrorMessage(e));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [isOpen, fetchConversations]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConversationId) return;

    const resp = await authFetch(
      `${chatBaseUrl}/v1/conversations/${deleteConversationId}`,
      { method: "DELETE" },
    );

    if (!resp.ok) {
      throw new Error(await parseDeleteError(resp));
    }

    await validateDeleteResponse(resp);

    if (deleteConversationId === conversationId) {
      startNewConversation(false);
    }

    await fetchConversations();
  }, [
    deleteConversationId,
    conversationId,
    startNewConversation,
    fetchConversations,
    authFetch,
    chatBaseUrl,
  ]);

  const conversationToDelete = conversations.find(
    ({ id }) => id === deleteConversationId,
  );

  return {
    conversations,
    isLoading,
    error,
    deleteConversationId,
    conversationToDelete,
    requestDelete: setDeleteConversationId,
    cancelDelete: () => setDeleteConversationId(undefined),
    confirmDelete,
  };
};
