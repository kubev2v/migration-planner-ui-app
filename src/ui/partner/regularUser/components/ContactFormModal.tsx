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
import type { PartnerRequestValues } from "../../../../models/PartnerRequestModel";
import { ContactForm } from "./ContactForm";

interface ContactFormModalProps {
  isOpen: boolean;
  partner: Partner;
  onClose: () => void;
  onSubmit: (values: PartnerRequestValues) => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  partner,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (values: PartnerRequestValues) => {
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
      <ModalHeader title={`Request Assignment - ${partner.name}`} />
      <ModalBody>
        <ContactForm
          id="contact-partner-form"
          partner={partner}
          onSubmit={handleSubmit}
        />
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
