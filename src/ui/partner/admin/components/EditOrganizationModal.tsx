import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

import type { Organization } from "../../../../models/OrganizationModel";
import {
  EditOrganizationForm,
  type EditOrganizationFormValues,
} from "./EditOrganizationForm";

export type { EditOrganizationFormValues as EditOrganizationFormValues };

interface EditOrganizationModalProps {
  isOpen: boolean;
  organization: Organization;
  onClose: () => void;
  onSubmit: (values: EditOrganizationFormValues) => void;
}

export const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({
  isOpen,
  organization,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (values: EditOrganizationFormValues) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Edit organization"
    >
      <ModalHeader title={`Edit organization - ${organization.name}`} />
      <ModalBody>
        <EditOrganizationForm
          id="edit-organization-form"
          organization={organization}
          onSubmit={handleSubmit}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" type="submit" form="edit-organization-form">
          Save Changes
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

EditOrganizationModal.displayName = "EditOrganizationModal";
