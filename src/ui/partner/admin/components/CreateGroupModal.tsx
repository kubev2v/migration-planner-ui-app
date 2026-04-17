import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@patternfly/react-core";
import React from "react";

import { type CreateGroupFormValues, GroupForm } from "./GroupForm";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupFormValues) => void | Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = async (values: CreateGroupFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Create group"
    >
      <ModalHeader title="Create group" />
      <ModalBody>
        <GroupForm
          id="create-group-form"
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" type="submit" form="create-group-form">
          Create
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CreateGroupModal.displayName = "CreateGroupModal";
