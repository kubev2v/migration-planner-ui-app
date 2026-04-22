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

interface CreateGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupMemberFormValues) => void | Promise<void>;
}

export const CreateGroupMemberModal: React.FC<CreateGroupMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = async (values: CreateGroupMemberFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Add group member"
    >
      <ModalHeader title="Add group member" />
      <ModalBody>
        <GroupMemberForm
          id="create-group-member-form"
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" type="submit" form="create-group-member-form">
          Add
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CreateGroupMemberModal.displayName = "CreateGroupMemberModal";
