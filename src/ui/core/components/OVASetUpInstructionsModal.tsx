import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@patternfly/react-core";
import React from "react";

import { OVASetUpInstructions } from "./OVASetUpInstructions";

export type OVASetUpInstructionsModalProps = {
  onClose: () => void;
};

export const OVASetUpInstructionsModal: React.FC<
  OVASetUpInstructionsModalProps
> = ({ onClose }) => (
  <Modal
    variant="medium"
    isOpen
    onClose={onClose}
    aria-labelledby="ova-setup-instructions-modal-title"
    aria-describedby="ova-setup-instructions-modal-body"
  >
    <ModalHeader
      title="OVA set up instructions"
      labelId="ova-setup-instructions-modal-title"
    />
    <ModalBody id="ova-setup-instructions-modal-body">
      <OVASetUpInstructions />
    </ModalBody>
    <ModalFooter>
      <Button variant="primary" onClick={onClose}>
        Close
      </Button>
    </ModalFooter>
  </Modal>
);

OVASetUpInstructionsModal.displayName = "OVASetUpInstructionsModal";
