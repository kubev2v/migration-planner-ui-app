import { useInjection } from "@openshift-migration-advisor/ioc";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { parseApiError } from "../../../lib/common/ErrorParser";

export const useAssessmentsStore = (): IAssessmentsStore => {
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );
  return assessmentsStore;
};

/**
 * Freeze a value on first render. Remount the consumer (change its React `key`)
 * to apply new initial values.
 */
export const useCapturedOnce = <T>(create: () => T): T => {
  const [value] = useState(create);
  return value;
};

export const useMappedAsyncError = (): {
  clear: () => void;
  capture: (err: unknown, fallbackMessage: string) => Promise<Error>;
  resolve: (asyncError: Error | undefined) => Error | undefined;
} => {
  const [manualError, setManualError] = useState<Error | undefined>(undefined);

  const clear = useCallback((): void => {
    setManualError(undefined);
  }, []);

  const capture = useCallback(
    async (err: unknown, fallbackMessage: string): Promise<Error> => {
      const error = await parseApiError(err, fallbackMessage);
      setManualError(error);
      return error;
    },
    [],
  );

  const resolve = useCallback(
    (asyncError: Error | undefined): Error | undefined =>
      manualError ?? asyncError,
    [manualError],
  );

  return { clear, capture, resolve };
};

export const useLatestRequest = (): {
  begin: (key: string) => string;
  isCurrent: (requestId: string) => boolean;
} => {
  const latestIdRef = useRef("");

  const begin = useCallback((key: string): string => {
    const requestId = `${key}-${Date.now()}`;
    latestIdRef.current = requestId;
    return requestId;
  }, []);

  const isCurrent = useCallback(
    (requestId: string): boolean => latestIdRef.current === requestId,
    [],
  );

  return { begin, isCurrent };
};
