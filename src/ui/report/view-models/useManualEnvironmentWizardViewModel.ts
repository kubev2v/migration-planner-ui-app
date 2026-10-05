import { useInjection } from "@openshift-migration-advisor/ioc";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Symbols } from "../../../config/Dependencies";
import type { IAssessmentsStore } from "../../../data/stores/interfaces/IAssessmentsStore";
import { routes } from "../../../routing/Routes";
import {
  createEmptyManualEnvironmentForm,
  formFromEnhancementData,
  toEnhancementData,
} from "../manual-environment/mapEnhancementData";
import { manualEnvironmentReportPath } from "../manual-environment/paths";
import type { ManualEnvironmentFormValues } from "../manual-environment/types";

export interface ManualEnvironmentWizardViewModel {
  isLoading: boolean;
  loadError: Error | null;
  assessmentName: string;
  reportPath: string;
  form: ManualEnvironmentFormValues;
  updateForm: (patch: Partial<ManualEnvironmentFormValues>) => void;
  isSaving: boolean;
  saveError: Error | null;
  save: () => Promise<void>;
  cancel: () => void;
  reload: () => void;
}

export const useManualEnvironmentWizardViewModel =
  (): ManualEnvironmentWizardViewModel => {
    const { id: assessmentId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const store = useInjection<IAssessmentsStore>(Symbols.AssessmentsStore);
    const [assessmentName, setAssessmentName] = useState("");
    const [form, setForm] = useState<ManualEnvironmentFormValues>(
      createEmptyManualEnvironmentForm,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<Error | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const reportPath = assessmentId
      ? manualEnvironmentReportPath(assessmentId)
      : routes.assessments;

    const reload = useCallback(() => {
      setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
      let cancelled = false;

      const load = async (): Promise<void> => {
        if (!assessmentId) {
          setLoadError(new Error("Assessment not found"));
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setLoadError(null);
        setSaveError(null);
        try {
          const [assessment, enhancement] = await Promise.all([
            store.get(assessmentId),
            store.getEnhancementData(assessmentId),
          ]);
          if (cancelled) return;
          setAssessmentName(assessment.name || `Assessment ${assessmentId}`);
          setForm(formFromEnhancementData(enhancement));
        } catch (err) {
          if (cancelled) return;
          setLoadError(
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

    const updateForm = useCallback(
      (patch: Partial<ManualEnvironmentFormValues>) => {
        setForm((current) => ({ ...current, ...patch }));
      },
      [],
    );

    const cancel = useCallback(() => {
      void navigate(reportPath);
    }, [navigate, reportPath]);

    const save = useCallback(async () => {
      if (!assessmentId || isSaving) return;
      setIsSaving(true);
      setSaveError(null);
      try {
        await store.saveEnhancementData(assessmentId, toEnhancementData(form));
        void navigate(reportPath);
      } catch (err) {
        setSaveError(
          err instanceof Error
            ? err
            : new Error("Failed to save manual environment details"),
        );
      } finally {
        setIsSaving(false);
      }
    }, [assessmentId, form, isSaving, navigate, reportPath, store]);

    return {
      isLoading,
      loadError,
      assessmentName,
      reportPath,
      form,
      updateForm,
      isSaving,
      saveError,
      save,
      cancel,
      reload,
    };
  };
