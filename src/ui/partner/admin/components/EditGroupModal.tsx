import type { Group } from "@openshift-migration-advisor/planner-sdk";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

import { EditGroupForm, type EditGroupFormValues } from "./EditGroupForm";

interface EditGroupModalProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
  onSubmit: (values: EditGroupFormValues) => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  group,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (values: EditGroupFormValues) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Edit group"
    >
      <ModalHeader title={`Edit group - ${group.name}`} />
      <ModalBody>
        <EditGroupForm
          id="edit-group-form"
          group={group}
          onSubmit={handleSubmit}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" type="submit" form="edit-group-form">
          Save Changes
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

EditGroupModal.displayName = "EditGroupModal";
