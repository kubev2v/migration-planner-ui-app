import React, { useCallback, useEffect, useState } from 'react';

import { Assessment } from '@migration-planner-ui/api-client/models';
import {
  Alert,
  Button,
  FileUpload,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';

import { AssessmentStatusIndicator } from '../../components/AssessmentStatusIndicator';

import { useAssessmentStatusPolling } from './hooks/useAssessmentStatusPolling';

export type AssessmentMode = 'inventory' | 'rvtools' | 'agent';

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (name: string, file: File | null) => Promise<Assessment>;
  mode: AssessmentMode;
  isLoading?: boolean;
  error?: Error | null;
  selectedEnvironment?: { id: string; name: string } | null;
  onSelectEnvironment?: (assessmentName: string) => void;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  mode,
  isLoading = false,
  error = null,
  selectedEnvironment = null,
  onSelectEnvironment: _onSelectEnvironment,
}) => {
  // Form state
  const [assessmentName, setAssessmentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [isFileLoading, _setIsFileLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [fileError, setFileError] = useState('');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState('');

  const statusPolling = useAssessmentStatusPolling(onCancel);

  const availableEnvironments = selectedEnvironment
    ? [selectedEnvironment]
    : [];

  const getFileConfig = (): {
    title: string;
    fileLabel: string;
    fileDescription: string;
    allowedExtensions: string[];
    accept: string;
  } => {
    switch (mode) {
      case 'inventory':
        return {
          title: 'Create Assessment from Inventory',
          fileLabel: 'Inventory File (JSON)',
          fileDescription: 'Select a JSON inventory file (max 50 MiB)',
          accept: '.json',
          allowedExtensions: ['json'],
        };
      case 'rvtools':
        return {
          title: 'Create migration assessment from RVTools',
          fileLabel: 'RVTools File (Excel)',
          fileDescription: 'Select an Excel file from RVTools (max 50 MiB)',
          accept: '.xlsx,.xls',
          allowedExtensions: ['xlsx', 'xls'],
        };
      case 'agent':
        return {
          title: 'Create migration assessment from Environment',
          fileLabel: 'Environment',
          fileDescription: 'Select an environment to create assessment from',
          accept: '',
          allowedExtensions: [],
        };
      default:
        return {
          title: 'Create Assessment',
          fileLabel: 'File',
          fileDescription: 'Select a file (max 50 MiB)',
          accept: '*',
          allowedExtensions: [],
        };
    }
  };

  const config = getFileConfig();

  const handleFileChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File,
  ): void => {
    const maxSize = 52428800; // 50 MiB
    const fileExtension = file.name.toLowerCase().split('.').pop();

    if (
      config.allowedExtensions.length > 0 &&
      !config.allowedExtensions.includes(fileExtension || '')
    ) {
      const extensionList = config.allowedExtensions.join(', ');
      setFileError(
        `Unsupported file format. Please select a ${extensionList} file.`,
      );
      setSelectedFile(null);
      setFilename('');
      return;
    }

    if (file.size > maxSize) {
      setFileError('The file is too big. Select a file up to 50 MiB.');
      setSelectedFile(null);
      setFilename('');
      return;
    }

    setFileError('');
    setSelectedFile(file);
    setFilename(file.name);
  };

  const handleFileClear = (): void => {
    setSelectedFile(null);
    setFilename('');
    setFileError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!assessmentName.trim()) {
      setNameError('Assessment name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    if (mode === 'agent' && !selectedEnvironment) {
      setFileError('Environment selection is required');
      isValid = false;
    } else if (mode !== 'agent' && !selectedFile) {
      setFileError('File upload is required');
      isValid = false;
    } else if (!fileError) {
      setFileError('');
    }

    return isValid;
  };

  const handleSubmit = async (): Promise<void> => {
    if (validateForm()) {
      try {
        const assessment = await onSubmit(assessmentName.trim(), selectedFile);

        if (mode === 'rvtools' && assessment) {
          statusPolling.startPolling(assessment.id);
        } else {
          handleClose();
        }
      } catch (err) {
        console.error('Error creating assessment:', err);
        // Error is handled by the parent component and passed as prop
        // The error will be displayed in the modal
      }
    }
  };

  const handleClose = useCallback((): void => {
    statusPolling.stopPolling();
    statusPolling.reset();
    setAssessmentName('');
    setSelectedFile(null);
    setFilename('');
    setNameError('');
    setFileError('');
    setSelectedEnvironmentId('');

    onClose();
  }, [statusPolling, onClose]);

  const handleCancel = async (): Promise<void> => {
    if (statusPolling.isPolling) {
      try {
        await statusPolling.cancelJob();
        handleClose();
      } catch (error) {
        console.error('Error cancelling assessment job:', error);
      }
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    if (statusPolling.status === 'ready') {
      handleClose();
    }
  }, [statusPolling.status, handleClose]);

  const isFormValid =
    assessmentName.trim() &&
    (mode === 'agent' ? selectedEnvironment : selectedFile);

  // Enable button when error occurs so user can retry
  const hasError = !!error || !!statusPolling.error;
  const isButtonDisabled =
    !isFormValid ||
    (isLoading && !hasError) ||
    (statusPolling.isPolling && !hasError);
  const isButtonLoading =
    (isLoading && !hasError) || (statusPolling.isPolling && !hasError);

  const actions = [
    <Button
      key="create"
      variant="primary"
      onClick={handleSubmit}
      isDisabled={isButtonDisabled}
      isLoading={isButtonLoading}
    >
      Create Migration Assessment
    </Button>,
    <Button key="cancel" variant="link" onClick={handleCancel}>
      Cancel
    </Button>,
    ...(statusPolling.status
      ? [
          <span
            key="status"
            style={{ marginLeft: 'auto', alignSelf: 'center' }}
          >
            <AssessmentStatusIndicator status={statusPolling.status} />
          </span>,
        ]
      : []),
  ];

  return (
    <Modal
      variant={ModalVariant.medium}
      title={config.title}
      isOpen={isOpen}
      onClose={handleClose}
      actions={actions}
    >
      <Form>
        <FormGroup label="Assessment Name" isRequired fieldId="assessment-name">
          <TextInput
            isRequired
            type="text"
            id="assessment-name"
            name="assessment-name"
            value={assessmentName}
            onChange={(_event, value) => {
              setAssessmentName(value);
              if (nameError && value.trim()) {
                setNameError('');
              }
              // Clear error when user starts typing (error will be cleared by context on next attempt)
            }}
            validated={nameError || error ? 'error' : 'default'}
            placeholder="Enter assessment name"
          />
          {nameError && (
            <div
              style={{
                color: 'var(--pf-global--danger-color--100)',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              {nameError}
            </div>
          )}
        </FormGroup>

        {mode === 'agent' ? (
          <FormGroup
            label={config.fileLabel}
            isRequired
            fieldId="assessment-environment"
          >
            <div
              style={{
                fontSize: '14px',
                color: 'var(--pf-global--Color--200)',
                marginBottom: '8px',
              }}
            >
              {config.fileDescription}
            </div>
            <FormSelect
              value={selectedEnvironmentId}
              onChange={(_event, value) => {
                setSelectedEnvironmentId(value);
                if (fileError && value) {
                  setFileError('');
                }
              }}
              validated={fileError ? 'error' : 'default'}
            >
              <FormSelectOption value="" label="Select an environment" />
              {availableEnvironments.map((env) => (
                <FormSelectOption
                  key={env.id}
                  value={env.id}
                  label={env.name}
                />
              ))}
            </FormSelect>
            {fileError && (
              <div
                style={{
                  color: 'var(--pf-global--danger-color--100)',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                {fileError}
              </div>
            )}
          </FormGroup>
        ) : (
          <FormGroup
            label={config.fileLabel}
            isRequired
            fieldId="assessment-file"
          >
            <div
              style={{
                fontSize: '14px',
                color: 'var(--pf-global--Color--200)',
                marginBottom: '8px',
              }}
            >
              {config.fileDescription}
            </div>
            <FileUpload
              id="assessment-file"
              type="text"
              value=""
              filename={filename}
              filenamePlaceholder="Drag and drop a file or select one"
              onFileInputChange={handleFileChange}
              onClearClick={handleFileClear}
              isLoading={isFileLoading}
              allowEditingUploadedText={false}
              browseButtonText="Select"
              validated={fileError ? 'error' : 'default'}
              accept={config.accept}
              hideDefaultPreview
            />
            {fileError && (
              <div
                style={{
                  color: 'var(--pf-global--danger-color--100)',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                {fileError}
              </div>
            )}
          </FormGroup>
        )}
      </Form>

      {/* API and Processing Errors - displayed above the Create button */}
      {(error || statusPolling.error) && (
        <Alert
          variant="danger"
          title={
            statusPolling.error
              ? 'Processing failed'
              : 'Failed to create assessment'
          }
          style={{ marginTop: '16px', marginBottom: '0' }}
          isInline
        >
          {statusPolling.error ||
            error?.message ||
            'An error occurred while creating the assessment'}
        </Alert>
      )}
    </Modal>
  );
};

CreateAssessmentModal.displayName = 'CreateAssessmentModal';

export default CreateAssessmentModal;
