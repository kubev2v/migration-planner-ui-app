import {
  Alert,
  Button,
  Form,
  FormAlert,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@patternfly/react-core";
import React, { useCallback, useEffect, useState } from "react";

import { getNetworkConfig } from "../../helpers/networkConfig";
import { getProxyConfig } from "../../helpers/proxyConfig";
import { useEnvironmentPage } from "../../view-models/EnvironmentPageContext";
import {
  EnvironmentForm,
  type EnvironmentFormErrors,
  type EnvironmentFormValues,
} from "./EnvironmentForm";
import {
  calculateFormChanges,
  getInitialErrors,
  getInitialFormValues,
  getModalMode,
  handleFieldChangeHelper,
  isSubmitDisabledHelper,
  type ModalMode,
  normalizeSshKey,
  validateField,
  validateProxyFields,
  validateSshKeyForMode,
  validateStaticIpSubmit,
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

  const [formValues, setFormValues] = useState<EnvironmentFormValues>(() =>
    getInitialFormValues(mode, editSource, editProxyConfig, editNetworkConfig),
  );

  const [initialValues] = useState<EnvironmentFormValues>(() =>
    mode === "edit"
      ? getInitialFormValues(
          mode,
          editSource,
          editProxyConfig,
          editNetworkConfig,
        )
      : getInitialFormValues("create"),
  );

  const [errors, setErrors] = useState<EnvironmentFormErrors>(getInitialErrors);

  const handleValidate = useCallback(
    (field: string): void => {
      validateField(field, formValues, setErrors);
    },
    [formValues],
  );

  const handleFieldChange = useCallback(
    (field: keyof EnvironmentFormValues, value: string | boolean): void => {
      handleFieldChangeHelper(field, value, setFormValues, setErrors);
    },
    [],
  );

  const resetForm = useCallback((): void => {
    if (mode === "create") {
      setFormValues(getInitialFormValues("create"));
    }
    setErrors(getInitialErrors());
    vm.clearErrors?.({
      ...(mode === "create" && { downloading: true, creating: true }),
      ...(mode === "edit" && { updating: true }),
    });
  }, [vm, mode]);

  const handleClose = useCallback((): void => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();

      if (!validateProxyFields(formValues, setErrors)) {
        return;
      }

      if (!validateSshKeyForMode(mode, formValues.sshKey, setErrors)) {
        return;
      }

      if (mode === "create" && formValues.environmentName === "") {
        return;
      }

      if (!validateStaticIpSubmit(formValues, setErrors)) {
        return;
      }

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
    [formValues, vm, mode, props, handleClose],
  );

  useEffect(() => {
    if (mode === "create" && vm.downloadSourceUrl && isOpen) {
      const url = vm.downloadSourceUrl;
      const name = formValues.environmentName;
      void Promise.resolve().then(() => {
        (props as CreateModeProps).onSuccess(url, name);
        resetForm();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.downloadSourceUrl, isOpen, mode]);

  const hasFormChanges =
    mode === "edit" ? calculateFormChanges(formValues, initialValues) : true;

  const isSubmitDisabled = isSubmitDisabledHelper(
    formValues,
    errors,
    mode,
    hasFormChanges,
  );

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
        <Form
          noValidate={false}
          id={modalConfig.formId}
          onSubmit={handleSubmit}
        >
          <EnvironmentForm
            mode={mode}
            formValues={formValues}
            errors={errors}
            onFieldChange={handleFieldChange}
            onValidate={handleValidate}
          />
          {errors.proxyGroupError && (
            <FormAlert>
              <Alert
                isInline
                variant="danger"
                title="Proxy configuration error"
              >
                {errors.proxyGroupError}
              </Alert>
            </FormAlert>
          )}
          {modalConfig.errorFlag && (
            <FormAlert>
              <Alert isInline variant="danger" title={modalConfig.errorTitle}>
                {modalConfig.errorFlag.message}
              </Alert>
            </FormAlert>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          form={modalConfig.formId}
          type="submit"
          key="confirm"
          variant="primary"
          isDisabled={isSubmitDisabled}
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
