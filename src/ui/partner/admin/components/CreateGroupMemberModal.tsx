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
  type CreateGroupMemberFormValues,
  GroupMemberForm,
} from "./GroupMemberForm";

interface CreateAuthorizedMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupMemberFormValues) => void | Promise<void>;
}

export const CreateGroupMemberModal: React.FC<
  CreateAuthorizedMemberModalProps
> = ({ isOpen, onClose, onSubmit }) => {
  const handleSubmit = async (values: CreateGroupMemberFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Add authorized member"
    >
      <ModalHeader title="Add authorized member" />
      <ModalBody>
        <GroupMemberForm
          id="create-authorized-member-form"
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          type="submit"
          form="create-authorized-member-form"
        >
          Add
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CreateGroupMemberModal.displayName = "CreateAuthorizedMemberModal";
