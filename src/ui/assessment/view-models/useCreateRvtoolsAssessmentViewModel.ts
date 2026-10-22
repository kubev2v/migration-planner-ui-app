import { useCallback, useEffect, useMemo, useState } from "react";

import type { RvtoolsFileUploadResult } from "../../../data/stores/JobsStore";
import {
  formatRvtoolsBackendErrorMessage,
  isAllowedRvtoolsExtension,
  MAX_RVTOOLS_FILES,
  RVTOOLS_MAX_FILE_BYTES,
} from "../helpers/rvtoolsFileRules";

export type StagedRvtoolsFileStatus =
  "staging" | "staged" | "valid" | "invalid";

export type StagedRvtoolsFile = {
  id: string;
  file: File;
  status: StagedRvtoolsFileStatus;
  /** Client-side staging progress (0–100). */
  progress: number;
  errorMessage?: string;
};

export type CreateRvtoolsAssessmentModalMode = "create" | "append";

export interface UseCreateRvtoolsAssessmentViewModelArgs {
  mode: CreateRvtoolsAssessmentModalMode;
  isOpen: boolean;
  isFormDisabled: boolean;
  onClearError?: () => void;
  onStagedFileRemoved?: (file: { fileName: string; fileSize: number }) => void;
  /** When create failed partway, valid files are already on this assessment. */
  resumePartialAssessmentId?: string;
  /**
   * When the user deletes the last failed file and every other file is already
   * on the partial assessment, close the flow and refresh the assessments list.
   */
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

const newStagedId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `staged-${Date.now()}-${Math.random()}`;

const STAGING_PROGRESS_STEP = 25;
const STAGING_PROGRESS_INTERVAL_MS = 120;

const matchesUploadResult = (
  file: File,
  result: RvtoolsFileUploadResult,
): boolean => file.name === result.fileName && file.size === result.fileSize;

export const useCreateRvtoolsAssessmentViewModel = ({
  mode,
  isOpen,
  isFormDisabled,
  onClearError,
  onStagedFileRemoved,
  resumePartialAssessmentId,
  onPartialAssessmentResolved,
}: UseCreateRvtoolsAssessmentViewModelArgs): CreateRvtoolsAssessmentViewModel => {
  const isResumingPartialCreate = Boolean(
    mode === "create" && resumePartialAssessmentId,
  );
  const [assessmentName, setAssessmentName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedRvtoolsFile[]>([]);
  const [filePickerError, setFilePickerError] = useState("");
  const [nameValidationError, setNameValidationError] = useState("");

  const resetForm = useCallback((): void => {
    setAssessmentName("");
    setConsentChecked(false);
    setStagedFiles([]);
    setFilePickerError("");
    setNameValidationError("");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setInterval(() => {
      setStagedFiles((current) => {
        let changed = false;
        const next: StagedRvtoolsFile[] = current.map((entry) => {
          if (entry.status !== "staging") {
            return entry;
          }
          changed = true;
          const nextProgress = Math.min(
            100,
            entry.progress + STAGING_PROGRESS_STEP,
          );
          if (nextProgress >= 100) {
            return {
              ...entry,
              progress: 100,
              status: "staged",
            };
          }
          return { ...entry, progress: nextProgress };
        });
        return changed ? next : current;
      });
    }, STAGING_PROGRESS_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isOpen]);

  const addFiles = useCallback(
    (files: File[]): void => {
      if (isFormDisabled) {
        return;
      }

      onClearError?.();
      setFilePickerError("");

      const remainingSlots = MAX_RVTOOLS_FILES - stagedFiles.length;
      if (remainingSlots <= 0) {
        setFilePickerError(`You can upload up to ${MAX_RVTOOLS_FILES} files.`);
        return;
      }

      const accepted = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        setFilePickerError(
          `Only ${remainingSlots} more file${remainingSlots === 1 ? "" : "s"} can be added (maximum ${MAX_RVTOOLS_FILES}).`,
        );
      }

      const newEntries: StagedRvtoolsFile[] = [];

      for (const file of accepted) {
        if (!isAllowedRvtoolsExtension(file.name)) {
          setFilePickerError(
            "Unsupported file format. Please select XLSX or XLS files.",
          );
          continue;
        }
        if (file.size > RVTOOLS_MAX_FILE_BYTES) {
          setFilePickerError(
            "The file is too big. Select a file up to 50 MiB.",
          );
          continue;
        }
        if (
          stagedFiles.some(
            (staged) =>
              staged.file.name === file.name && staged.file.size === file.size,
          )
        ) {
          continue;
        }
        newEntries.push({
          id: newStagedId(),
          file,
          status: "staging",
          progress: 0,
        });
      }

      if (newEntries.length > 0) {
        setStagedFiles((current) => [...current, ...newEntries]);
      }
    },
    [isFormDisabled, onClearError, stagedFiles],
  );

  const removeFile = useCallback(
    (id: string, options?: { fromReplace?: boolean }): void => {
      const removed = stagedFiles.find((entry) => entry.id === id);
      let next = stagedFiles.filter((entry) => entry.id !== id);
      if (removed) {
        onStagedFileRemoved?.({
          fileName: removed.file.name,
          fileSize: removed.file.size,
        });
      }
      const hasInvalidRemaining = next.some(
        (entry) => entry.status === "invalid",
      );
      if (!hasInvalidRemaining) {
        onClearError?.();
        if (!isResumingPartialCreate) {
          next = next.map((entry) =>
            entry.status === "valid"
              ? {
                  ...entry,
                  status: "staged",
                  errorMessage: undefined,
                }
              : entry,
          );
        }
      }

      const shouldResolvePartialAssessment =
        !options?.fromReplace &&
        isResumingPartialCreate &&
        removed?.status === "invalid" &&
        !hasInvalidRemaining &&
        !next.some(
          (entry) => entry.status === "staged" || entry.status === "staging",
        );

      setStagedFiles(next);
      setFilePickerError("");

      if (shouldResolvePartialAssessment) {
        resetForm();
        onPartialAssessmentResolved?.();
      }
    },
    [
      isResumingPartialCreate,
      onClearError,
      onPartialAssessmentResolved,
      onStagedFileRemoved,
      resetForm,
      stagedFiles,
    ],
  );

  const replaceFile = useCallback(
    (id: string, file: File): void => {
      removeFile(id, { fromReplace: true });
      addFiles([file]);
    },
    [addFiles, removeFile],
  );

  const applyUploadResults = useCallback(
    (results: RvtoolsFileUploadResult[]): void => {
      setStagedFiles((current) =>
        current.map((entry) => {
          const result = results.find((item) =>
            matchesUploadResult(entry.file, item),
          );
          if (!result) {
            return entry;
          }
          if (result.status === "valid") {
            return {
              ...entry,
              status: "valid",
              progress: 100,
              errorMessage: undefined,
            };
          }
          if (result.status === "invalid") {
            return {
              ...entry,
              status: "invalid",
              progress: 100,
              errorMessage: result.errorMessage
                ? formatRvtoolsBackendErrorMessage(result.errorMessage)
                : undefined,
            };
          }
          return entry;
        }),
      );
    },
    [],
  );

  /** Files to send on submit (excludes invalid and files already on a partial assessment). */
  const submitableFiles = useMemo(
    () =>
      stagedFiles.filter((entry) => {
        if (entry.status === "invalid") {
          return false;
        }
        if (isResumingPartialCreate) {
          return entry.status === "staged";
        }
        return entry.status === "staged" || entry.status === "valid";
      }),
    [isResumingPartialCreate, stagedFiles],
  );

  const validFileCount = useMemo(
    () => stagedFiles.filter((entry) => entry.status === "valid").length,
    [stagedFiles],
  );

  const invalidFileCount = useMemo(
    () => stagedFiles.filter((entry) => entry.status === "invalid").length,
    [stagedFiles],
  );

  const hasStagingInProgress = useMemo(
    () => stagedFiles.some((entry) => entry.status === "staging"),
    [stagedFiles],
  );

  const showReviewTable = invalidFileCount > 0;

  const canSubmit =
    submitableFiles.length > 0 &&
    !hasStagingInProgress &&
    consentChecked &&
    (mode === "append" || assessmentName.trim().length > 0);

  const primaryButtonLabel = useMemo(() => {
    const submitCount = submitableFiles.length;
    if (mode === "append") {
      if (showReviewTable && invalidFileCount > 0) {
        return submitCount === 1
          ? "Add RVTools file"
          : `Add ${submitCount} RVTools files`;
      }
      return submitCount === 1
        ? "Add RVTools file"
        : `Add ${submitCount} RVTools files`;
    }
    if (showReviewTable && invalidFileCount > 0) {
      return submitCount === 1
        ? "Create assessment with 1 file"
        : `Create assessment with ${submitCount} files`;
    }
    if (isResumingPartialCreate) {
      return submitCount === 1
        ? "Add file to assessment"
        : `Add ${submitCount} files to assessment`;
    }
    return "Create assessment";
  }, [
    invalidFileCount,
    isResumingPartialCreate,
    mode,
    showReviewTable,
    submitableFiles.length,
  ]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    if (mode === "create" && !assessmentName.trim()) {
      setNameValidationError("Assessment name is required");
      isValid = false;
    } else {
      setNameValidationError("");
    }
    if (submitableFiles.length === 0) {
      setFilePickerError("At least one RVTools file is required");
      isValid = false;
    }
    return isValid;
  }, [assessmentName, mode, submitableFiles.length]);

  const getStagedFilesForSubmit = useCallback(
    (): File[] => submitableFiles.map((entry) => entry.file),
    [submitableFiles],
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
    stagedFiles,
    addFiles,
    removeFile,
    replaceFile,
    applyUploadResults,
    resetForm,
    filePickerError,
    nameValidationError,
    validFileCount,
    invalidFileCount,
    submitableFileCount: submitableFiles.length,
    showReviewTable,
    canSubmit,
    primaryButtonLabel,
    validateForm,
    getStagedFilesForSubmit,
  };
};
