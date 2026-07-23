import {
  Alert,
  Button,
  ClipboardCopy,
  clipboardCopyFunc,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React from "react";

import { VCenterSetupInstructions } from "../../../core/components/VCenterSetupInstructions";
import { useSourceDownload } from "../../hooks/useSourceDownload";
import { useApplianceVersionViewModel } from "../../view-models/useApplianceVersionViewModel";
import { ApplianceVersionDefinitionList } from "./ApplianceVersionSection";

export interface DownloadEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl?: string;
  sourceName: string;
  sourceId?: string;
  onStartDownload?: () => void;
  onAfterDownload?: () => Promise<void>;
}

export const DownloadEnvironmentModal: React.FC<
  DownloadEnvironmentModalProps
> = ({
  isOpen,
  onClose,
  downloadUrl: providedUrl,
  sourceName,
  sourceId,
  onStartDownload,
  onAfterDownload,
}) => {
  const applianceVersion = useApplianceVersionViewModel();
  const { downloadUrl, isLoading, startDownload } = useSourceDownload({
    isOpen,
    providedUrl,
    sourceId,
  });

  const handleDownload = (): void => {
    startDownload(sourceName, onStartDownload, async () => {
      await onAfterDownload?.();
      onClose?.();
    });
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="DownloadEnvironmentModal"
      aria-labelledby="download-environment-modal-title"
      aria-describedby="modal-box-body-download-environment"
    >
      <ModalHeader
        title="Download OVA"
        labelId="download-environment-modal-title"
      />
      <ModalBody id="modal-box-body-download-environment">
        {isLoading ? (
          <Stack hasGutter>
            <StackItem style={{ textAlign: "center", padding: "2rem" }}>
              <Spinner size="lg" />
              <div style={{ marginTop: "1rem" }}>Loading download URL...</div>
            </StackItem>
          </Stack>
        ) : !downloadUrl ? (
          <Stack hasGutter>
            <StackItem>
              <Alert
                isInline
                variant="warning"
                title="Download URL not available"
              >
                The download URL for this environment could not be retrieved.
                Please try again or contact support.
              </Alert>
            </StackItem>
          </Stack>
        ) : (
          <Stack hasGutter>
            <StackItem>
              <Alert isInline variant="success" title="Instructions">
                <VCenterSetupInstructions />
              </Alert>
            </StackItem>
            <StackItem>
              <ApplianceVersionDefinitionList {...applianceVersion} />
            </StackItem>
            <StackItem>
              <Content key="Ova Download URL" component={ContentVariants.dt}>
                Ova Download URL
              </Content>

              <Content
                key={`dd-Ova Download URL`}
                component={ContentVariants.dd}
              >
                <ClipboardCopy
                  isReadOnly
                  onCopy={(event) => clipboardCopyFunc(event, downloadUrl)}
                >
                  {downloadUrl}
                </ClipboardCopy>
              </Content>
            </StackItem>
            <StackItem>
              <Alert
                isInline
                variant="info"
                title="Never share your downloaded OVA with anyone else. Forwarding it might put your credentials and personal data at risk."
              />
            </StackItem>
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="download"
          variant="primary"
          onClick={handleDownload}
          isDisabled={isLoading || !downloadUrl}
        >
          Download OVA
        </Button>
        <Button key="close" variant="link" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
