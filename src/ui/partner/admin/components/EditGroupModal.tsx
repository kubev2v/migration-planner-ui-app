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

import { type EditGroupFormValues, GroupForm } from "./GroupForm";

interface EditGroupModalProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
  onSubmit: (values: EditGroupFormValues) => void | Promise<void>;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  group,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = async (values: EditGroupFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Edit group"
    >
      <ModalHeader title={`Edit group - ${group.name}`} />
      <ModalBody>
        <GroupForm
          id="edit-group-form"
          group={group}
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
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
