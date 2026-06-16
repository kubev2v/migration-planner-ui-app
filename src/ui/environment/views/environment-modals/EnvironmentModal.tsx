import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@patternfly/react-core";
import React, { useCallback, useEffect, useState } from "react";

import { getNetworkConfig } from "../../helpers/networkConfig";
import { getProxyConfig } from "../../helpers/proxyConfig";
import { normalizeSshKey } from "../../helpers/sshKey";
import { useEnvironmentPage } from "../../view-models/EnvironmentPageContext";
import { EnvironmentForm, type EnvironmentFormValues } from "./EnvironmentForm";
import {
  getInitialFormValues,
  getModalMode,
  type ModalMode,
} from "./helpers/environmentModalHelpers";

type CreateModeProps = {
  sourceId?: never;
  onSuccess: (downloadUrl: string, sourceName: string) => void;
};

type EditModeProps = {
  sourceId: string;
  onSuccess?: () => void;
};

export type EnvironmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
} & (CreateModeProps | EditModeProps);

export const EnvironmentModal: React.FC<EnvironmentModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const vm = useEnvironmentPage();

  const mode: ModalMode = getModalMode(props.sourceId);

  const editSource = props.sourceId
    ? vm.getSourceById?.(props.sourceId)
    : undefined;
  const editProxyConfig = editSource ? getProxyConfig(editSource) : null;
  const editNetworkConfig = editSource ? getNetworkConfig(editSource) : null;

  const [initialValues] = useState<EnvironmentFormValues | undefined>(() =>
    mode === "edit"
      ? getInitialFormValues(
          mode,
          editSource,
          editProxyConfig,
          editNetworkConfig,
        )
      : undefined,
  );

  const [isValid, setIsValid] = useState(false);

  const resetForm = useCallback((): void => {
    vm.clearErrors?.({
      ...(mode === "create" && { downloading: true, creating: true }),
      ...(mode === "edit" && { updating: true }),
    });
  }, [vm, mode]);

  const handleClose = useCallback((): void => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    (formValues: EnvironmentFormValues) => {
      if (mode === "create") {
        void vm.createDownloadSource({
          name: formValues.environmentName,
          sshPublicKey: normalizeSshKey(formValues.sshKey),
          enableProxy: formValues.enableProxy,
          httpProxy: formValues.httpProxy,
          httpsProxy: formValues.httpsProxy,
          noProxy: formValues.noProxy,
          networkConfigType: formValues.networkConfigType,
          ipAddress: formValues.ipAddress,
          subnetMask: formValues.subnetMask,
          defaultGateway: formValues.defaultGateway,
          dns: formValues.dns,
        });
      } else {
        const editProps = props as EditModeProps;
        void vm
          .updateSource({
            sourceId: editProps.sourceId,
            sshPublicKey: normalizeSshKey(formValues.sshKey),
            enableProxy: formValues.enableProxy,
            httpProxy: formValues.httpProxy,
            httpsProxy: formValues.httpsProxy,
            noProxy: formValues.noProxy,
            networkConfigType: formValues.networkConfigType,
            ipAddress: formValues.ipAddress,
            subnetMask: formValues.subnetMask,
            defaultGateway: formValues.defaultGateway,
            dns: formValues.dns,
          })
          .then(() => {
            void vm.listSources();
            editProps.onSuccess?.();
            handleClose();
          });
      }
    },
    [vm, mode, props, handleClose],
  );

  useEffect(() => {
    if (mode === "create" && vm.downloadSourceUrl && isOpen) {
      const url = vm.downloadSourceUrl;
      const name = initialValues?.environmentName || "";
      void Promise.resolve().then(() => {
        (props as CreateModeProps).onSuccess(url, name);
        resetForm();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.downloadSourceUrl, isOpen, mode]);

  const modalConfig = {
    create: {
      title: "Add Environment",
      description:
        "To add a new environment, create a discovery OVA image. Then, download and import the OVA file into your VMware environment.",
      submitText: "Generate OVA",
      formId: "create-environment-form",
      ouiaId: "CreateEnvironmentModal",
      ariaLabelledBy: "create-environment-modal-title",
      ariaDescribedBy: "modal-box-body-create-environment",
      errorFlag: vm.errorDownloadingSource,
      errorTitle: "Add Environment error",
    },
    edit: {
      title: "Update Environment",
      description: undefined,
      submitText: "Update OVA configuration",
      formId: "edit-environment-form",
      ouiaId: "EditEnvironmentModal",
      ariaLabelledBy: "edit-environment-modal-title",
      ariaDescribedBy: "modal-box-body-edit-environment",
      errorFlag: vm.errorUpdatingSource,
      errorTitle: "Update Environment error",
    },
  }[mode];

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={handleClose}
      ouiaId={modalConfig.ouiaId}
      aria-labelledby={modalConfig.ariaLabelledBy}
      aria-describedby={modalConfig.ariaDescribedBy}
      key={props.sourceId}
    >
      <ModalHeader
        title={modalConfig.title}
        labelId={modalConfig.ariaLabelledBy}
        description={modalConfig.description}
      />
      <ModalBody id={modalConfig.ariaDescribedBy}>
        <EnvironmentForm
          id={modalConfig.formId}
          formValues={initialValues}
          onSubmit={handleSubmit}
          setIsValid={setIsValid}
          hasError={!!modalConfig.errorFlag}
          errorTitle={modalConfig.errorTitle}
          errorMessage={modalConfig.errorFlag?.message}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          form={modalConfig.formId}
          type="submit"
          key="confirm"
          variant="primary"
          isDisabled={!isValid}
        >
          {modalConfig.submitText}
        </Button>
        <Button key="cancel" variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
