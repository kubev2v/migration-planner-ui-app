import { css } from "@emotion/css";
import {
  Alert,
  Button,
  Checkbox,
  ExpandableSection,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  TextInput,
  Truncate,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FileIcon,
  RhUiExternalLinkIcon,
  RhUiTrashIcon,
  RhUiUploadIcon,
} from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useRef } from "react";

import type { RvtoolsUploadState } from "../../../../data/stores/JobsStore";
import { isNameError } from "../../../../lib/common/ErrorParser";
import {
  formatRvtoolsFileSize,
  MAX_RVTOOLS_FILES,
  RVTOOLS_ACCEPT,
  RVTOOLS_DATA_SHARING_URL,
  RVTOOLS_FILE_REQUIREMENTS_URL,
} from "../../helpers/rvtoolsFileRules";
import {
  type CreateRvtoolsAssessmentModalMode,
  useCreateRvtoolsAssessmentViewModel,
} from "../../view-models/useCreateRvtoolsAssessmentViewModel";
import {
  dropzoneIntroStyle,
  dropzoneStyle,
  dropzoneTextStyle,
  reviewTableActionsStyle,
  reviewTableStyle,
  stagedFileActionsStyle,
  stagedFileCompleteIconStyle,
  stagedFileMetaStyle,
  stagedFileNameStyle,
  stagedFilePercentStyle,
  stagedFileProgressStyle,
  stagedFileRowStyle,
  stagedFilesListStyle,
  stagedFilesPanelStyle,
  stagedFilesToolbarIconStyle,
  stagedFilesToolbarToggleStyle,
} from "./styles";

const hiddenInputStyle = css`
  display: none;
`;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);
  const [isStagedFilesExpanded, setIsStagedFilesExpanded] =
    React.useState(true);

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
    setIsStagedFilesExpanded(true);
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

  const openFilePicker = (): void => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const list = event.target.files;
    if (list?.length) {
      vm.addFiles(Array.from(list));
    }
    event.target.value = "";
  };

  const onDropzoneDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDropzoneDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (isFormDisabled) {
      return;
    }
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length > 0) {
      vm.addFiles(files);
    }
  };

  const onReplaceSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    const targetId = replaceTargetIdRef.current;
    if (file && targetId) {
      vm.replaceFile(targetId, file);
    }
    replaceTargetIdRef.current = null;
    event.target.value = "";
  };

  const triggerReplace = (stagedId: string): void => {
    replaceTargetIdRef.current = stagedId;
    replaceInputRef.current?.click();
  };

  const showStagedList = vm.stagedFiles.length > 0 && !vm.showReviewTable;

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

          {mode === "create" && resumePartialAssessmentId && (
            <Alert
              variant="info"
              isInline
              title="An assessment was started with your valid files"
              style={{ marginBottom: "var(--pf-t--global--spacer--md)" }}
            >
              Remove or replace any invalid files, then add the remaining files
              to the same assessment.
            </Alert>
          )}

          <FormGroup
            label="RVTools files (Excel)"
            isRequired
            fieldId="rvtools-files"
          >
            <div className={dropzoneIntroStyle}>
              Select one or more Excel files from RVTools. Multiple files are
              merged into one assessment.
              <br />
              <a
                href={RVTOOLS_FILE_REQUIREMENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                RVTools file requirements
              </a>
            </div>

            <div
              className={dropzoneStyle}
              onDragOver={onDropzoneDragOver}
              onDrop={onDropzoneDrop}
            >
              <RhUiUploadIcon />
              <div className={dropzoneTextStyle}>
                <div>Drag and drop files here or</div>
                <div>
                  Accepted file types: XLSX, XLS. Up to {MAX_RVTOOLS_FILES}{" "}
                  files.
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={openFilePicker}
                isDisabled={
                  isFormDisabled || vm.stagedFiles.length >= MAX_RVTOOLS_FILES
                }
              >
                Select files
              </Button>
              <input
                ref={fileInputRef}
                className={hiddenInputStyle}
                type="file"
                accept={RVTOOLS_ACCEPT}
                multiple
                onChange={onFilesSelected}
                disabled={isFormDisabled}
              />
              <input
                ref={replaceInputRef}
                className={hiddenInputStyle}
                type="file"
                accept={RVTOOLS_ACCEPT}
                onChange={onReplaceSelected}
                disabled={isFormDisabled}
              />
            </div>

            {vm.filePickerError && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem
                    variant="error"
                    data-testid="upload-field-helper-text"
                  >
                    {vm.filePickerError}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}

            {showStagedList && (
              <ExpandableSection
                className={stagedFilesPanelStyle}
                toggleContent={
                  <span className={stagedFilesToolbarToggleStyle}>
                    <CheckCircleIcon
                      className={stagedFilesToolbarIconStyle}
                      aria-hidden
                    />
                    {vm.stagedFiles.length} of {MAX_RVTOOLS_FILES} files
                    selected
                  </span>
                }
                isExpanded={isStagedFilesExpanded}
                onToggle={(_event, expanded) => {
                  setIsStagedFilesExpanded(expanded);
                }}
              >
                <div className={stagedFilesListStyle}>
                  {vm.stagedFiles.map((staged) => {
                    const isComplete = staged.progress >= 100;
                    return (
                      <div key={staged.id} className={stagedFileRowStyle}>
                        <div className={stagedFileMetaStyle}>
                          <FileIcon aria-hidden />
                          <span className={stagedFileNameStyle}>
                            <Truncate content={staged.file.name} />
                            <span>
                              {" "}
                              {formatRvtoolsFileSize(staged.file.size)}
                            </span>
                          </span>
                        </div>
                        <div className={stagedFileActionsStyle}>
                          <span className={stagedFilePercentStyle}>
                            {staged.progress}%
                          </span>
                          {isComplete && (
                            <CheckCircleIcon
                              className={stagedFileCompleteIconStyle}
                              aria-label="Ready"
                            />
                          )}
                          <Button
                            variant="plain"
                            aria-label={`Remove ${staged.file.name}`}
                            onClick={() => vm.removeFile(staged.id)}
                            isDisabled={isFormDisabled}
                          >
                            <RhUiTrashIcon />
                          </Button>
                        </div>
                        <div className={stagedFileProgressStyle}>
                          <Progress
                            value={staged.progress}
                            aria-label={`Upload progress for ${staged.file.name}`}
                            size={ProgressSize.sm}
                            variant={isComplete ? "success" : undefined}
                            measureLocation={ProgressMeasureLocation.none}
                            hideStatusIcon
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ExpandableSection>
            )}

            {vm.showReviewTable && (
              <>
                <Alert
                  variant="danger"
                  isInline
                  title={
                    vm.invalidFileCount === 1
                      ? "1 file could not be validated"
                      : `${vm.invalidFileCount} files could not be validated`
                  }
                  style={{ marginTop: "16px" }}
                >
                  Remove or replace invalid files, or create the assessment with
                  the {vm.submitableFileCount} remaining file
                  {vm.submitableFileCount === 1 ? "" : "s"}.
                </Alert>
                <Table
                  aria-label="RVTools file validation results"
                  variant="compact"
                  className={reviewTableStyle}
                >
                  <Thead>
                    <Tr>
                      <Th modifier="fitContent">Status</Th>
                      <Th>File</Th>
                      <Th modifier="fitContent">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vm.stagedFiles.map((staged) => (
                      <Tr key={staged.id}>
                        <Td>
                          {staged.status === "valid" ? (
                            <Label color="green" icon={<CheckCircleIcon />}>
                              Valid
                            </Label>
                          ) : staged.status === "invalid" ? (
                            <Label color="red" icon={<ExclamationCircleIcon />}>
                              Invalid
                            </Label>
                          ) : null}
                        </Td>
                        <Td dataLabel="File">
                          <Truncate content={staged.file.name} />
                          {staged.errorMessage && (
                            <HelperText>
                              <HelperTextItem variant="error">
                                {staged.errorMessage}
                              </HelperTextItem>
                            </HelperText>
                          )}
                        </Td>
                        <Td isActionCell>
                          <div className={reviewTableActionsStyle}>
                            {staged.status === "invalid" && (
                              <Button
                                variant="link"
                                isInline
                                onClick={() => triggerReplace(staged.id)}
                                isDisabled={isFormDisabled}
                              >
                                Replace
                              </Button>
                            )}
                            <Button
                              variant="plain"
                              aria-label={`Delete ${staged.file.name}`}
                              onClick={() => vm.removeFile(staged.id)}
                              isDisabled={isFormDisabled}
                            >
                              <RhUiTrashIcon />
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </FormGroup>

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
