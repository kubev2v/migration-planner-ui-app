import type { RvtoolsFileValidationResult } from "@openshift-migration-advisor/shared-components";
import {
  type RvtoolsStagedFile,
  useRvtoolsFileStaging,
} from "@openshift-migration-advisor/shared-components";
import { useCallback, useMemo, useState } from "react";

import type { RvtoolsFileUploadResult } from "../../../data/stores/JobsStore";

export type StagedRvtoolsFileStatus = RvtoolsStagedFile["status"];
export type StagedRvtoolsFile = RvtoolsStagedFile;
export type CreateRvtoolsAssessmentModalMode = "create" | "append";

export interface UseCreateRvtoolsAssessmentViewModelArgs {
  mode: CreateRvtoolsAssessmentModalMode;
  isOpen: boolean;
  isFormDisabled: boolean;
  maxFiles?: number;
  onClearError?: () => void;
  onStagedFileRemoved?: (file: { fileName: string; fileSize: number }) => void;
  resumePartialAssessmentId?: string;
  onPartialAssessmentResolved?: () => void;
}

export interface CreateRvtoolsAssessmentViewModel {
  assessmentName: string;
  setAssessmentName: (name: string) => void;
  consentChecked: boolean;
  setConsentChecked: (checked: boolean) => void;
  stagedFiles: StagedRvtoolsFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  replaceFile: (id: string, file: File) => void;
  applyUploadResults: (results: RvtoolsFileUploadResult[]) => void;
  resetForm: () => void;
  filePickerError: string;
  nameValidationError: string;
  validFileCount: number;
  invalidFileCount: number;
  submitableFileCount: number;
  showReviewTable: boolean;
  canSubmit: boolean;
  primaryButtonLabel: string;
  validateForm: () => boolean;
  getStagedFilesForSubmit: () => File[];
}

const toValidationResults = (
  results: RvtoolsFileUploadResult[],
): RvtoolsFileValidationResult[] =>
  results.map((entry) => ({
    fileName: entry.fileName,
    fileSize: entry.fileSize,
    status: entry.status,
    errorMessage: entry.errorMessage,
  }));

export const useCreateRvtoolsAssessmentViewModel = ({
  mode,
  isOpen,
  isFormDisabled,
  onClearError,
  onStagedFileRemoved,
  resumePartialAssessmentId,
  onPartialAssessmentResolved,
  maxFiles,
}: UseCreateRvtoolsAssessmentViewModelArgs): CreateRvtoolsAssessmentViewModel => {
  const [assessmentName, setAssessmentName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [nameValidationError, setNameValidationError] = useState("");

  const staging = useRvtoolsFileStaging({
    mode,
    isActive: isOpen,
    isDisabled: isFormDisabled,
    resumePartialAssessmentId,
    onClearError,
    onStagedFileRemoved,
    onPartialAssessmentResolved,
    maxFiles,
  });

  const isResumingPartialCreate = Boolean(
    mode === "create" && resumePartialAssessmentId,
  );

  const hasStagingInProgress = useMemo(
    () => staging.stagedFiles.some((entry) => entry.status === "staging"),
    [staging.stagedFiles],
  );

  const canSubmit =
    staging.submitableFileCount > 0 &&
    !hasStagingInProgress &&
    consentChecked &&
    (mode === "append" || assessmentName.trim().length > 0);

  const primaryButtonLabel = useMemo(() => {
    const submitCount = staging.submitableFileCount;
    if (mode === "append") {
      if (!staging.showReviewTable) {
        return "Add files and update assessment";
      }
      if (staging.invalidFileCount > 0) {
        return submitCount === 1
          ? "Add RVTools file"
          : `Add ${submitCount} RVTools files`;
      }
      return "Add files and update assessment";
    }
    if (staging.showReviewTable && staging.submitableFileCount > 0) {
      return staging.submitableFileCount === 1
        ? "Create assessment with 1 file"
        : `Create assessment with ${staging.submitableFileCount} files`;
    }
    if (isResumingPartialCreate) {
      return submitCount === 1
        ? "Add file to assessment"
        : `Add ${submitCount} files to assessment`;
    }
    return "Create assessment";
  }, [
    isResumingPartialCreate,
    mode,
    staging.invalidFileCount,
    staging.showReviewTable,
    staging.submitableFileCount,
  ]);

  const resetForm = useCallback((): void => {
    setAssessmentName("");
    setConsentChecked(false);
    setNameValidationError("");
    staging.reset();
  }, [staging]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    if (mode === "create" && !assessmentName.trim()) {
      setNameValidationError("Assessment name is required");
      isValid = false;
    } else {
      setNameValidationError("");
    }
    if (staging.submitableFileCount === 0) {
      isValid = false;
    }
    return isValid;
  }, [assessmentName, mode, staging.submitableFileCount]);

  const applyUploadResults = useCallback(
    (results: RvtoolsFileUploadResult[]): void => {
      staging.applyValidationResults(toValidationResults(results));
    },
    [staging],
  );

  return {
    assessmentName,
    setAssessmentName: (name: string) => {
      setAssessmentName(name);
      if (nameValidationError && name.trim()) {
        setNameValidationError("");
      }
      onClearError?.();
    },
    consentChecked,
    setConsentChecked,
    stagedFiles: staging.stagedFiles,
    addFiles: staging.addFiles,
    removeFile: staging.removeFile,
    replaceFile: staging.replaceFile,
    applyUploadResults,
    resetForm,
    filePickerError: staging.filePickerError,
    nameValidationError,
    validFileCount: staging.validFileCount,
    invalidFileCount: staging.invalidFileCount,
    submitableFileCount: staging.submitableFileCount,
    showReviewTable: staging.showReviewTable,
    canSubmit,
    primaryButtonLabel,
    validateForm,
    getStagedFilesForSubmit: staging.getFilesForSubmit,
  };
};
