export const getChatBaseUrl = (): string => {
  if (process.env.OMA_LIGHTSPEED_URL) {
    return process.env.OMA_LIGHTSPEED_URL;
  }
  if (process.env.CHAT_API_URL) {
    return process.env.CHAT_API_URL.replace("/v1/query", "");
  }
  return "/api/chat";
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

export const generateId = (): string =>
  `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
