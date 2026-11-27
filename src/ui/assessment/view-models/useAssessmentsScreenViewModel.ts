import { useInjection } from "@openshift-migration-advisor/ioc";
import { useState, useSyncExternalStore } from "react";
import { useAsyncFn, useMount, useUnmount } from "react-use";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { DEFAULT_POLLING_DELAY } from "../../../lib/mvvm/PollableStore";
import type { AssessmentModel } from "../../../models/AssessmentModel";

export interface AssessmentsScreenViewModel {
  assessments: AssessmentModel[];
  isLoading: boolean;
  hasInitialLoad: boolean;
}

export const useAssessmentsScreenViewModel = (): AssessmentsScreenViewModel => {
  const assessmentsStore = useInjection<IAssessmentsStore>(
    Symbols.AssessmentsStore,
  );
  const assessments = useSyncExternalStore(
    assessmentsStore.subscribe.bind(assessmentsStore),
    assessmentsStore.getSnapshot.bind(assessmentsStore),
  );

  const [hasInitialLoad, setHasInitialLoad] = useState(
    assessmentsStore.hasLoaded,
  );

  const [fetchState, fetchAssessments] = useAsyncFn(
    async () => {
      try {
        return await assessmentsStore.list();
      } finally {
        setHasInitialLoad(true);
      }
    },
    [assessmentsStore],
    { loading: !assessmentsStore.hasLoaded },
  );

  useMount(() => {
    if (!assessmentsStore.hasLoaded) {
      void fetchAssessments();
    }
    assessmentsStore.startPolling(DEFAULT_POLLING_DELAY);
  });

  useUnmount(() => {
    assessmentsStore.stopPolling();
  });

  return {
    assessments,
    isLoading: fetchState.loading,
    hasInitialLoad,
  };
};
