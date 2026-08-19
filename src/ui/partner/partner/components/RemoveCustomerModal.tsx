import type { Customer } from "@openshift-migration-advisor/planner-sdk";
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

interface RemoveCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const RemoveCustomerModal: React.FC<RemoveCustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Remove customer"
    >
      <ModalHeader title="Remove customer" titleIconVariant="warning" />
      <ModalBody>
        <Content component="p">
          Remove <strong>{customer?.name}</strong> from your customers?
        </Content>
        <Content component="p">
          This customer will revert to a regular user and any assessments they
          shared with you will no longer be visible. This action cannot be
          undone.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          onClick={() => {
            void handleConfirm();
          }}
        >
          Remove
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

RemoveCustomerModal.displayName = "RemoveCustomerModal";
