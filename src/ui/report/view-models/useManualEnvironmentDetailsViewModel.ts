import { useInjection } from "@openshift-migration-advisor/ioc";
import type { EnhancementData } from "@openshift-migration-advisor/planner-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { routes } from "../../../routing/Routes";
import {
  buildManualEnvironmentSummary,
  hasEnhancementContent,
} from "../manual-environment/mapEnhancementData";
import type { ManualEnvironmentSummary } from "../manual-environment/types";

export interface ManualEnvironmentDetailsViewModel {
  isLoading: boolean;
  error: Error | null;
  hasSavedDetails: boolean;
  summary: ManualEnvironmentSummary;
  reload: () => void;
  openWizard: () => void;
}

export const useManualEnvironmentDetailsViewModel =
  (): ManualEnvironmentDetailsViewModel => {
    const { id: assessmentId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const store = useInjection<IAssessmentsStore>(Symbols.AssessmentsStore);
    const [details, setDetails] = useState<EnhancementData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const reload = useCallback(() => {
      setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
      let cancelled = false;

      const load = async (): Promise<void> => {
        if (!assessmentId) {
          setDetails(null);
          setError(new Error("Assessment not found"));
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        try {
          const data = await store.getEnhancementData(assessmentId);
          if (cancelled) return;
          setDetails(data);
        } catch (err) {
          if (cancelled) return;
          setDetails(null);
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to load manual environment details"),
          );
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      void load();
      return () => {
        cancelled = true;
      };
    }, [assessmentId, reloadToken, store]);

    const summary = useMemo(
      () => buildManualEnvironmentSummary(details),
      [details],
    );

    const openWizard = useCallback(() => {
      if (!assessmentId) return;
      void navigate(routes.manualEnvironmentDetails(assessmentId));
    }, [assessmentId, navigate]);

    return {
      isLoading,
      error,
      hasSavedDetails: hasEnhancementContent(details),
      summary,
      reload,
      openWizard,
    };
  };
