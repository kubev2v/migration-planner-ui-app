import type { PartnerRequestCreate } from "@openshift-migration-advisor/planner-sdk";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

import type { Partner } from "../../../../models/PartnerModel";
import { ContactForm } from "./ContactForm";

interface ContactFormModalProps {
  isOpen: boolean;
  partner: Partner;
  onClose: () => void;
  onSubmit: (values: PartnerRequestCreate) => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  partner,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (values: PartnerRequestCreate) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Contact Partner"
    >
      <ModalHeader title={`Request assignment - ${partner.name}`} />
      <ModalBody>
        <ContactForm id="contact-partner-form" onSubmit={handleSubmit} />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" type="submit" form="contact-partner-form">
          Submit Request
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ContactFormModal.displayName = "ContactFormModal";
