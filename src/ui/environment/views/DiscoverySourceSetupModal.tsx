import {
  Alert,
  Button,
  ClipboardCopy,
  clipboardCopyFunc,
  Content,
  ContentVariants,
  FormAlert,
  Modal /* data-codemods */,
  ModalBody /* data-codemods */,
  ModalFooter /* data-codemods */,
  ModalHeader /* data-codemods */,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import React, { useMemo, useState } from "react";

import { VCenterSetupInstructions } from "../../core/components/VCenterSetupInstructions";
import {
  type Environment,
  EnvironmentForm,
} from "../components/EnvironmentForm";
import { getNetworkConfig } from "../helpers/networkConfig";
import { getProxyConfig } from "../helpers/proxyConfig";
import { normalizeSshKey } from "../helpers/sshKey";
import { useEnvironmentPage } from "../view-models/EnvironmentPageContext";

export interface DiscoverySourceSetupModalProps {
  isOpen?: boolean;
  isDisabled?: boolean;
  onClose: (event?: KeyboardEvent | React.MouseEvent) => void;
  onStartDownload: () => void;
  onAfterDownload: () => Promise<void>;
}

export const DiscoverySourceSetupModal: React.FC<
  DiscoverySourceSetupModalProps
> = (props) => {
  const vm = useEnvironmentPage();
  const { isOpen = false, onClose, onStartDownload, onAfterDownload } = props;
  const [isFormValid, setIsFormValid] = useState(true);

  const backToOvaConfiguration = (): void => {
    vm.setDownloadUrl("");
  };

  const cleanErrorsAndClose = (): void => {
    vm.clearErrors?.({
      downloading: true,
      updating: true,
      creating: true,
    });
    onClose();
  };

  const download = () => {
    onStartDownload();
    const anchor = document.createElement("a");
    const sourceName = vm.sourceSelected?.name || "unknown-environment";
    anchor.download = sourceName + ".ova";
    anchor.href = vm.downloadSourceUrl;
    anchor.click();
    anchor.remove();
    void onAfterDownload().then(cleanErrorsAndClose);
  };

  const environment = useMemo(() => {
    const sourceSelected = vm.sourceSelected;
    if (sourceSelected) {
      const proxyConfig = getProxyConfig(sourceSelected);
      const networkConfig = getNetworkConfig(sourceSelected);
      return {
        name: sourceSelected.name,
        sshKey: "",
        ...proxyConfig,
        ...networkConfig,
      } as Environment;
    }
    return null;
  }, [vm.sourceSelected]);

  const modalTitle =
    vm.sourceSelected === null ? "Add Environment" : "Update Environment";

  if (vm.downloadSourceUrl) {
    return (
      <Modal
        variant="small"
        isOpen={isOpen}
        onClose={cleanErrorsAndClose}
        ouiaId="DiscoverySourceSetupModal"
        aria-labelledby="discovery-source-setup-modal-title"
        aria-describedby="modal-box-body-discovery-source-setup"
      >
        <ModalHeader
          title={modalTitle}
          labelId="discovery-source-setup-modal-title"
        />
        <ModalBody id="modal-box-body-discovery-source-setup">
          <div>
            <Stack hasGutter>
              <StackItem>
                <Alert isInline variant="success" title="Instructions">
                  <VCenterSetupInstructions />
                </Alert>
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
                    onCopy={(event) =>
                      clipboardCopyFunc(event, vm.downloadSourceUrl)
                    }
                  >
                    {vm.downloadSourceUrl}
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
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            form="discovery-source-setup-form"
            type="submit"
            key="confirm"
            variant="primary"
            onClick={download}
          >
            Download OVA
          </Button>
          <Button key="cancel" variant="link" onClick={cleanErrorsAndClose}>
            Close
          </Button>
          <Button key="primary" variant="link" onClick={backToOvaConfiguration}>
            Edit OVA configuration
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={cleanErrorsAndClose}
      ouiaId="DiscoverySourceSetupModal"
      aria-labelledby="discovery-source-setup-modal-title"
      aria-describedby="modal-box-body-discovery-source-setup"
    >
      <ModalHeader
        title={modalTitle}
        labelId="discovery-source-setup-modal-title"
        description="To add a new environment create a discovery OVA image. Then download and import the OVA file into your VMWare environment"
      />
      <ModalBody id="modal-box-body-discovery-source-setup">
        <EnvironmentForm
          id="discovery-source-setup-form"
          setIsValid={setIsFormValid}
          environment={environment || undefined}
          onSubmit={(values) => {
            const {
              name,
              sshKey,
              enableProxy,
              httpProxy,
              httpsProxy,
              noProxy,
              networkConfigType,
              ipAddress,
              subnetMask,
              defaultGateway,
              dns,
            } = values;
            if (vm.sourceSelected === null) {
              // createDownloadSource is useAsyncFn-backed; fire-and-forget.
              void vm
                .createDownloadSource({
                  name,
                  sshPublicKey: normalizeSshKey(sshKey),
                  enableProxy,
                  httpProxy,
                  httpsProxy,
                  noProxy,
                  networkConfigType,
                  ipAddress,
                  subnetMask,
                  defaultGateway,
                  dns,
                })
                .then(() => {});
            } else {
              // Both updateSource and listSources are useAsyncFn-backed in the VM.
              void vm
                .updateSource({
                  sourceId: vm.sourceSelected.id,
                  sshPublicKey: normalizeSshKey(sshKey),
                  enableProxy,
                  httpProxy,
                  httpsProxy,
                  noProxy,
                  networkConfigType,
                  ipAddress,
                  subnetMask,
                  defaultGateway,
                  dns,
                })
                .then(() => vm.listSources());
            }
          }}
        />
        {vm.errorDownloadingSource && (
          <FormAlert>
            <Alert isInline variant="danger" title="Add Environment error">
              {vm.errorDownloadingSource.message}
            </Alert>
          </FormAlert>
        )}
        {vm.errorUpdatingSource && (
          <FormAlert>
            <Alert isInline variant="danger" title="Update Environment error">
              {vm.errorUpdatingSource.message}
            </Alert>
          </FormAlert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          form="discovery-source-setup-form"
          type="submit"
          key="confirm"
          variant="primary"
          isDisabled={!isFormValid}
        >
          {vm.sourceSelected === null
            ? "Generate OVA"
            : "Update OVA configuration"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
