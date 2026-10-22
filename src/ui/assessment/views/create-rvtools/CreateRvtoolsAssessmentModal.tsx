import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from "@patternfly/react-core";
import { RhUiExternalLinkIcon } from "@patternfly/react-icons";
import {
  RvtoolsFilesField,
  RVTOOLS_DATA_SHARING_URL,
} from "@openshift-migration-advisor/shared-components";
import React, { useRef } from "react";

import type { RvtoolsUploadState } from "../../../../data/stores/JobsStore";
import { isNameError } from "../../../../lib/common/ErrorParser";
import {
  type CreateRvtoolsAssessmentModalMode,
  useCreateRvtoolsAssessmentViewModel,
} from "../../view-models/useCreateRvtoolsAssessmentViewModel";

export interface CreateRvtoolsAssessmentModalProps {
  mode: CreateRvtoolsAssessmentModalMode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; files: File[] }) => void;
  onClearError?: () => void;
  onStagedFileRemoved?: (file: { fileName: string; fileSize: number }) => void;
  isLoading?: boolean;
  error?: Error | null;
  /** `true` while the job is actively processing (non-terminal status). */
  isJobProcessing?: boolean;
  jobProgressValue?: number;
  jobProgressLabel?: string;
  jobError?: Error | null;
  rvtoolsUpload?: RvtoolsUploadState;
  resumePartialAssessmentId?: string;
  onPartialAssessmentResolved?: () => void;
  isNavigatingToReport?: boolean;
  defaultAssessmentName?: string;
}

const isAbortError = (error: Error | null): boolean => {
  if (!error) return false;
  const message = error.message || "";
  return (
    (typeof (error as { name?: unknown }).name === "string" &&
      (error as { name: string }).name === "AbortError") ||
    (error instanceof DOMException &&
      typeof error.message === "string" &&
      /aborted/i.test(error.message)) ||
    /aborted/i.test(message)
  );
};

export const CreateRvtoolsAssessmentModal: React.FC<
  CreateRvtoolsAssessmentModalProps
> = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
  onClearError,
  onStagedFileRemoved,
  isLoading = false,
  error = null,
  isJobProcessing = false,
  jobProgressValue = 0,
  jobProgressLabel = "",
  jobError = null,
  rvtoolsUpload,
  resumePartialAssessmentId,
  onPartialAssessmentResolved,
  isNavigatingToReport = false,
  defaultAssessmentName = "",
}) => {
  const isFormDisabled = isLoading || isJobProcessing || isNavigatingToReport;

  const vm = useCreateRvtoolsAssessmentViewModel({
    mode,
    isOpen,
    isFormDisabled,
    onClearError,
    onStagedFileRemoved,
    resumePartialAssessmentId,
    onPartialAssessmentResolved,
  });

  const lastAppliedUploadResultsKeyRef = useRef("");

  React.useEffect(() => {
    if (isOpen && defaultAssessmentName && mode === "create") {
      vm.setAssessmentName(defaultAssessmentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only seed name when modal opens
  }, [defaultAssessmentName, isOpen, mode]);

  const { applyUploadResults } = vm;

  React.useEffect(() => {
    const results = rvtoolsUpload?.results;
    if (!results?.length) {
      lastAppliedUploadResultsKeyRef.current = "";
      return;
    }
    const resultsKey = results
      .map(
        (entry) =>
          `${entry.fileName}:${entry.fileSize}:${entry.status}:${entry.errorMessage ?? ""}`,
      )
      .join("|");
    if (resultsKey === lastAppliedUploadResultsKeyRef.current) {
      return;
    }
    lastAppliedUploadResultsKeyRef.current = resultsKey;
    applyUploadResults(results);
  }, [applyUploadResults, rvtoolsUpload?.results]);

  const effectiveError = jobError || error;
  const hasNameError = isNameError(effectiveError);
  const hasGeneralApiError =
    !!effectiveError &&
    !isNameError(effectiveError) &&
    !isAbortError(effectiveError);

  const nameErrorToDisplay =
    vm.nameValidationError || (hasNameError ? effectiveError?.message : "");

  const handleClose = (): void => {
    vm.resetForm();
    onClearError?.();
    onClose();
  };

  const handleSubmit = (): void => {
    if (!vm.validateForm() || !vm.canSubmit) {
      return;
    }

    onSubmit({
      name: vm.assessmentName.trim(),
      files: vm.getStagedFilesForSubmit(),
    });
  };

  const showReviewApiError =
    hasGeneralApiError && !vm.showReviewTable && !vm.canSubmit;

  const isButtonDisabled =
    !vm.canSubmit ||
    isLoading ||
    !!nameErrorToDisplay ||
    !!vm.filePickerError ||
    showReviewApiError ||
    isJobProcessing ||
    isNavigatingToReport;

  const progressMessage = isNavigatingToReport
    ? "Opening report..."
    : isLoading
      ? "Uploading files.."
      : `${jobProgressValue}% done. ${jobProgressLabel}`;

  const title =
    mode === "append" ? "Add RVTools files" : "Create assessment from RVTools";

  const partialNotice =
    mode === "create" && resumePartialAssessmentId
      ? (
          <Alert
            variant="info"
            isInline
            title="An assessment was started with your valid files"
            style={{ marginBottom: "var(--pf-t--global--spacer--md)" }}
          >
            Remove or replace any invalid files, then add the remaining files to
            the same assessment.
          </Alert>
        )
      : undefined;

  return (
    <Modal variant="medium" isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title={title} />
      <ModalBody>
        <Form>
          {mode === "create" && (
            <FormGroup
              label="Assessment name"
              isRequired
              fieldId="rvtools-assessment-name"
            >
              <TextInput
                isRequired
                type="text"
                id="rvtools-assessment-name"
                name="rvtools-assessment-name"
                value={vm.assessmentName}
                onChange={(_event, value) => vm.setAssessmentName(value)}
                validated={nameErrorToDisplay ? "error" : "default"}
                placeholder="Enter assessment name"
                isDisabled={isFormDisabled}
              />
              {nameErrorToDisplay && (
                <HelperText>
                  <HelperTextItem variant="error">
                    {nameErrorToDisplay}
                  </HelperTextItem>
                </HelperText>
              )}
            </FormGroup>
          )}

          <RvtoolsFilesField
            mode={mode}
            isDisabled={isFormDisabled}
            stagedFiles={vm.stagedFiles}
            filePickerError={vm.filePickerError}
            showReviewTable={vm.showReviewTable}
            invalidFileCount={vm.invalidFileCount}
            submitableFileCount={vm.submitableFileCount}
            onAddFiles={vm.addFiles}
            onRemoveFile={vm.removeFile}
            onReplaceFile={vm.replaceFile}
            partialAssessmentNotice={partialNotice}
            fieldId="rvtools-files"
          />

          <Checkbox
            id="rvtools-data-share-consent"
            label={
              <>
                I agree to share aggregated data about my environment with Red
                Hat.{" "}
                <a
                  href={RVTOOLS_DATA_SHARING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more <RhUiExternalLinkIcon />
                </a>
              </>
            }
            isChecked={vm.consentChecked}
            onChange={(_event, checked) => {
              vm.setConsentChecked(Boolean(checked));
            }}
            isRequired
            isDisabled={isFormDisabled}
          />
        </Form>

        {showReviewApiError && (
          <Alert
            variant="danger"
            title="Failed to create assessment"
            style={{ marginTop: "16px", marginBottom: "0" }}
            isInline
          >
            {effectiveError?.message ||
              "An error occurred while creating the assessment"}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="create"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={isButtonDisabled}
          isLoading={isLoading || isJobProcessing || isNavigatingToReport}
        >
          {vm.primaryButtonLabel}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={isNavigatingToReport}
        >
          Cancel
        </Button>
        {(isLoading || isJobProcessing || isNavigatingToReport) && (
          <div key="progress" style={{ marginRight: "auto" }}>
            {progressMessage}
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};

CreateRvtoolsAssessmentModal.displayName = "CreateRvtoolsAssessmentModal";

export default CreateRvtoolsAssessmentModal;
