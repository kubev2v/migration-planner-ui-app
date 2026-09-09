import { ResponseError } from "@openshift-migration-advisor/planner-sdk";

export const mapAssessmentApiError = async (
  err: unknown,
  fallbackMessage: string,
): Promise<Error> => {
  if (err instanceof ResponseError) {
    const message = await err.response.text();
    const combinedMessage = message
      ? `${err.message}: ${message}`
      : err.message;
    return new Error(combinedMessage, { cause: message });
  }
  return err instanceof Error ? err : new Error(fallbackMessage);
};
