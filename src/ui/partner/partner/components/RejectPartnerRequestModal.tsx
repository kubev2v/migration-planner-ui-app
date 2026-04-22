import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

import {
  RejectPartnerRequestForm,
  type RejectPartnerRequestFormValues,
} from "./RejectPartnerRequestForm";

interface RejectPartnerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RejectPartnerRequestFormValues) => void | Promise<void>;
}

export const RejectPartnerRequestModal: React.FC<
  RejectPartnerRequestModalProps
> = ({ isOpen, onClose, onSubmit }) => {
  const handleSubmit = async (values: RejectPartnerRequestFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Reject partner request"
    >
      <ModalHeader title="Reject customer request" />
      <ModalBody>
        <RejectPartnerRequestForm
          id="reject-partner-request-form"
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          type="submit"
          form="reject-partner-request-form"
        >
          Reject
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

RejectPartnerRequestModal.displayName = "RejectPartnerRequestModal";
