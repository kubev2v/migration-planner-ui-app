import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Content,
  StackItem,
} from "@patternfly/react-core";
import React, { useCallback, useEffect, useState } from "react";
import {
  EnvironmentPageProvider,
  useEnvironmentPage,
} from "../view-models/EnvironmentPageContext";
import { DiscoverySourceSetupModal } from "./DiscoverySourceSetupModal";
import { SourcesTable } from "./SourcesTable";
import { TroubleshootingModal } from "./TroubleshootingModal";

const EnvironmentContent: React.FC = () => {
  const vm = useEnvironmentPage();

  const [
    shouldShowDiscoverySourceSetupModal,
    setShouldShowDiscoverySetupModal,
  ] = useState(false);

  const [editSourceId, setEditSourceId] = useState<string | null>(null);

  const toggleDiscoverySourceSetupModal = useCallback((): void => {
    setShouldShowDiscoverySetupModal((lastState) => !lastState);
  }, []);
  const [firstSource, ..._otherSources] = vm.sources ?? [];
  const sourceSelected =
    (vm.sourceSelected &&
      vm.sources?.find((source) => source.id === vm.sourceSelected?.id)) ||
    firstSource;
  const [isOvaDownloading, setIsOvaDownloading] = useState(false);
  const uploadResult = vm.inventoryUploadResult;
  const uploadMessage = uploadResult?.message ?? null;
  const isUploadError = uploadResult?.isError ?? false;
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);

  useEffect(() => {
    if (uploadMessage && !isUploadError) {
      // Only auto-dismiss success messages, keep error messages persistent
      const timeout = setTimeout(() => {
        vm.clearInventoryUploadResult();
      }, 5000); // dissapears after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [uploadMessage, isUploadError, vm]);

  useEffect(() => {
    if (isOvaDownloading) {
      const timeout = setTimeout(() => {
        setIsOvaDownloading(false);
      }, 5000); // dissapears after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [isOvaDownloading]);

  return (
    <>
      {/* Critical error alerts at the top for visibility */}
      {uploadMessage && isUploadError && (
        <div style={{ marginBottom: "16px" }}>
          <Alert
            isInline
            variant="danger"
            title="Upload error"
            actionClose={
              <AlertActionCloseButton
                onClose={() => vm.clearInventoryUploadResult()}
              />
            }
          >
            {uploadMessage}
          </Alert>
        </div>
      )}

      {vm.errorDownloadingSource && (
        <div style={{ marginBottom: "16px" }}>
          <Alert
            isInline
            variant="danger"
            title="Download Environment error"
            actionClose={
              <AlertActionCloseButton
                onClose={() => {
                  vm.clearErrors({ downloading: true });
                }}
              />
            }
          >
            {vm.errorDownloadingSource.message}
          </Alert>
        </div>
      )}

      <SourcesTable
        onEditEnvironment={(sourceId) => {
          setEditSourceId(sourceId);
          vm.selectSourceById?.(sourceId);
          setShouldShowDiscoverySetupModal(true);
        }}
        onAddEnvironment={() => {
          setEditSourceId(null);
          toggleDiscoverySourceSetupModal();
        }}
      />

      {isOvaDownloading && (
        <StackItem>
          <Alert isInline variant="info" title="Download OVA image">
            The OVA image is downloading
          </Alert>
        </StackItem>
      )}

      {sourceSelected?.agent &&
        sourceSelected?.agent.status === "waiting-for-credentials" && (
          <StackItem>
            <Alert
              isInline
              variant="custom"
              title="Discovery VM"
              actionLinks={
                <AlertActionLink
                  component="a"
                  href={sourceSelected?.agent.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sourceSelected?.agent.credentialUrl}
                </AlertActionLink>
              }
            >
              <Content>
                <Content component="p">
                  Click the link below to connect the Discovery Source to your
                  VMware environment.
                </Content>
              </Content>
            </Alert>
          </StackItem>
        )}

      {uploadMessage && !isUploadError && (
        <StackItem>
          <Alert isInline variant="success" title="Upload success">
            {uploadMessage}
          </Alert>
        </StackItem>
      )}

      {shouldShowDiscoverySourceSetupModal && (
        <DiscoverySourceSetupModal
          isOpen={shouldShowDiscoverySourceSetupModal}
          onClose={() => {
            setEditSourceId(null);
            toggleDiscoverySourceSetupModal();
            void vm.listSources();
          }}
          isDisabled={vm.isDownloadingSource}
          onStartDownload={() => setIsOvaDownloading(true)}
          onAfterDownload={async () => {
            await vm.listSources();
          }}
          editSourceId={editSourceId || undefined}
        />
      )}
      <TroubleshootingModal
        isOpen={isTroubleshootingOpen}
        onClose={() => setIsTroubleshootingOpen(false)}
      />
    </>
  );
};

export const Environment: React.FC = () => (
  <EnvironmentPageProvider>
    <EnvironmentContent />
  </EnvironmentPageProvider>
);

Environment.displayName = "Environment";
