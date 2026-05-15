import useChrome from "@redhat-cloud-services/frontend-components/useChrome";
import { useCallback, useMemo, useRef, useState } from "react";

import { generateId, getErrorMessage } from "../helpers";
import type {
  ChatMessage,
  ConversationHistoryResponse,
  StreamEvent,
} from "../types";

const getChatBaseUrl = (): string => {
  if (process.env.OMA_LIGHTSPEED_URL) {
    return process.env.OMA_LIGHTSPEED_URL;
  }
  if (process.env.CHAT_API_URL) {
    return process.env.CHAT_API_URL.replace("/v1/query", "");
  }
  return "/api/chat";
};

interface UseMessagesResult {
  messages: ChatMessage[];
  conversationId: string | undefined;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | undefined;
  sendMessage: (message: string) => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (convId: string) => Promise<void>;
  resetError: () => void;
}

export const useMessages = (): UseMessagesResult => {
  const chrome = useChrome();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const requestVersionRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

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

  const loadConversation = useCallback(
    async (convId: string) => {
      const requestVersion = ++requestVersionRef.current;
      activeControllerRef.current?.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      setIsLoading(true);
      setError(undefined);
      setMessages([]);

      try {
        const resp = await authFetch(
          `${chatBaseUrl}/v1/conversations/${convId}`,
          { signal: controller.signal },
        );
        if (!resp.ok) {
          throw new Error(`Failed to load conversation: ${resp.status}`);
        }

        const conv = (await resp.json()) as ConversationHistoryResponse;
        if (requestVersion !== requestVersionRef.current) return;

        const msgs = conv.chat_history.flatMap(
          ({ messages: historyMsgs, completed_at }) => {
            const timestamp = new Date(completed_at);
            return historyMsgs.map<ChatMessage>(({ content, type }) => ({
              id: generateId(),
              role: type === "assistant" ? "assistant" : "user",
              content,
              timestamp,
            }));
          },
        );

        setConversationId(convId);
        setMessages(msgs);
      } catch (e) {
        if (controller.signal.aborted) return;
        if (requestVersion !== requestVersionRef.current) return;
        setError(getErrorMessage(e));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
        }
      }
    },
    [authFetch, chatBaseUrl],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      const requestVersion = ++requestVersionRef.current;
      activeControllerRef.current?.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      setError(undefined);
      setIsStreaming(true);

      const timestamp = new Date();
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: message,
        timestamp,
      };

      setMessages((msgs) => [
        ...msgs,
        userMessage,
        {
          id: generateId(),
          role: "assistant",
          content: "",
          timestamp,
        },
      ]);

      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

      try {
        const resp = await authFetch(`${chatBaseUrl}/v1/streaming_query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: message,
            conversation_id: conversationId,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          let errMsg = `Request failed: ${resp.status}`;
          try {
            const errData = (await resp.json()) as {
              detail?: string | { response?: string };
            };
            if (errData.detail) {
              errMsg =
                typeof errData.detail === "string"
                  ? errData.detail
                  : (errData.detail.response ?? errMsg);
            }
          } catch {
            // Use default error
          }
          throw new Error(errMsg);
        }

        if (!resp.body) {
          throw new Error("Streaming response body is unavailable");
        }

        reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let newConvId = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");
            let data = "";
            for (const line of lines) {
              if (line.startsWith("data:")) {
                data += line.slice(5).trim() + "\n";
              }
            }

            if (!data.trim()) continue;

            try {
              const ev = JSON.parse(data) as StreamEvent;

              if (ev.event === "start" && "data" in ev) {
                newConvId = ev.data.conversation_id;
              } else if (ev.event === "token" && "data" in ev) {
                const { token } = ev.data;
                if (requestVersion !== requestVersionRef.current) continue;
                setMessages((msgs) => {
                  const lastMsg = msgs[msgs.length - 1];
                  if (!lastMsg || lastMsg.role !== "assistant") {
                    return msgs;
                  }
                  const allButLast = msgs.slice(0, -1);
                  return [
                    ...allButLast,
                    {
                      ...lastMsg,
                      content: lastMsg.content + token,
                    },
                  ];
                });
              }
            } catch {
              // Skip malformed events
            }
          }
        }

        if (requestVersion !== requestVersionRef.current) return;

        if (newConvId) {
          setConversationId(newConvId);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        if (requestVersion !== requestVersionRef.current) return;
        if (reader) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancel errors
          }
        }
        setError(getErrorMessage(e));
        setMessages((msgs) => {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg?.role === "assistant" && !lastMsg.content) {
            return msgs.slice(0, -1);
          }
          return msgs;
        });
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsStreaming(false);
        }
      }
    },
    [conversationId, authFetch, chatBaseUrl],
  );

  const startNewConversation = useCallback(() => {
    requestVersionRef.current += 1;
    activeControllerRef.current?.abort();
    setConversationId(undefined);
    setMessages([]);
    setError(undefined);
  }, []);

  const resetError = useCallback(() => {
    setError(undefined);
  }, []);

  return {
    messages,
    conversationId,
    isStreaming,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    loadConversation,
    resetError,
  };
};
