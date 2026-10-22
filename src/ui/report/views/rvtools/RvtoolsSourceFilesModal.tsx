import { css } from "@emotion/css";
import {
  Alert,
  Button,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Truncate,
} from "@patternfly/react-core";
import { RhUiTrashIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useRef } from "react";

import { RVTOOLS_ACCEPT } from "../../../assessment/helpers/rvtoolsFileRules";
import { formatRvtoolsBackendErrorMessage } from "../../../assessment/helpers/rvtoolsFileRules";

const actionsStyle = css`
  display: flex;
  align-items: center;
  gap: var(--pf-t--global--spacer--sm);
`;

export type RvtoolsSourceFileDraftRow = {
  id: string;
  fileName: string;
  uploadedAt: string;
  replacementFile?: File;
  errorMessage?: string;
};

export type RvtoolsSourceFilesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rows: RvtoolsSourceFileDraftRow[];
  onReplaceRow: (rowId: string, file: File) => void;
  onRemoveRow: (rowId: string) => void;
  onCreateNewAssessment: () => void;
  isSubmitting?: boolean;
  showCreateFailedAlert?: boolean;
};

const formatUploaded = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const RvtoolsSourceFilesModal: React.FC<
  RvtoolsSourceFilesModalProps
> = ({
  isOpen,
  onClose,
  rows,
  onReplaceRow,
  onRemoveRow,
  onCreateNewAssessment,
  isSubmitting = false,
  showCreateFailedAlert = false,
}) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);
  const showTrash = rows.length > 1;

  const triggerReplace = (rowId: string): void => {
    replaceTargetIdRef.current = rowId;
    replaceInputRef.current?.click();
  };

  const onReplaceSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    const rowId = replaceTargetIdRef.current;
    if (file && rowId) {
      onReplaceRow(rowId, file);
    }
    replaceTargetIdRef.current = null;
    event.target.value = "";
  };

  return (
    <Modal variant="medium" isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Source files" />
      <ModalBody>
        <p>
          Review the RVTools files included in this assessment. Replace or
          remove files here, then create a new assessment to apply those changes
          to the report. Changes are not applied until you create a new
          assessment.
        </p>
        {showCreateFailedAlert ? (
          <Alert
            variant="danger"
            isInline
            title="Could not create a new assessment because of a file error. The current assessment remains unchanged."
            style={{ marginBottom: "var(--pf-t--global--spacer--md)" }}
          />
        ) : null}
        <input
          ref={replaceInputRef}
          type="file"
          accept={RVTOOLS_ACCEPT}
          style={{ display: "none" }}
          onChange={onReplaceSelected}
          disabled={isSubmitting}
        />
        <Table aria-label="Source files" variant="compact">
          <Thead>
            <Tr>
              <Th>File</Th>
              <Th>Uploaded</Th>
              <Th modifier="fitContent">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td dataLabel="File">
                  <Truncate
                    content={row.replacementFile?.name ?? row.fileName}
                  />
                  {row.errorMessage ? (
                    <HelperText>
                      <HelperTextItem variant="error">
                        {formatRvtoolsBackendErrorMessage(row.errorMessage)}
                      </HelperTextItem>
                    </HelperText>
                  ) : null}
                </Td>
                <Td dataLabel="Uploaded">{formatUploaded(row.uploadedAt)}</Td>
                <Td isActionCell>
                  <div className={actionsStyle}>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => triggerReplace(row.id)}
                      isDisabled={isSubmitting}
                    >
                      Replace
                    </Button>
                    {showTrash ? (
                      <Button
                        variant="plain"
                        aria-label={`Remove ${row.fileName}`}
                        onClick={() => onRemoveRow(row.id)}
                        isDisabled={isSubmitting}
                      >
                        <RhUiTrashIcon />
                      </Button>
                    ) : null}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={onCreateNewAssessment}
          isDisabled={isSubmitting || rows.length === 0}
          isLoading={isSubmitting}
        >
          Create new assessment
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

RvtoolsSourceFilesModal.displayName = "RvtoolsSourceFilesModal";
