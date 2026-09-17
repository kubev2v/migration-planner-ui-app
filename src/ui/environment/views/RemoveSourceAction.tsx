import { Button, Content, Icon, Tooltip } from "@patternfly/react-core";
import { RhUiTrashIcon } from "@patternfly/react-icons";
import React, { useCallback, useState } from "react";

import { themeTooltipFlyoutProps } from "../../../lib/patternfly/flyoutAppendTo";
import { ConfirmationModal } from "../../core/components/ConfirmationModal";

type ConfirmEventHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent> & {
    dismissConfirmationModal: () => void;
    showConfirmationModal: () => void;
  },
) => void;

type RemoveSourceActionProps = {
  sourceId: string;
  isDisabled: boolean;
  onConfirm?: ConfirmEventHandler;
  sourceName?: string;
};

export function RemoveSourceAction({
  sourceId,
  isDisabled = false,
  onConfirm,
  sourceName,
}: RemoveSourceActionProps) {
  const [shouldShowConfirmationModal, setShouldShowConfirmationModal] =
    useState(false);
  const dismissConfirmationModal = useCallback((): void => {
    setShouldShowConfirmationModal(false);
  }, []);
  const showConfirmationModal = useCallback((): void => {
    setShouldShowConfirmationModal(true);
  }, []);

  const handleConfirm = useCallback<ConfirmEventHandler>(
    (event) => {
      if (onConfirm) {
        event.dismissConfirmationModal = dismissConfirmationModal;
        onConfirm(event);
      }
    },
    [dismissConfirmationModal, onConfirm],
  );

  return (
    <>
      <Tooltip {...themeTooltipFlyoutProps} content="Remove">
        <Button
          icon={
            <Icon size="md" isInline>
              <RhUiTrashIcon />
            </Icon>
          }
          data-source-id={sourceId}
          variant="plain"
          isDisabled={isDisabled}
          onClick={showConfirmationModal}
        />
      </Tooltip>
      {onConfirm && shouldShowConfirmationModal && (
        <ConfirmationModal
          title="Delete Environment"
          titleIconVariant="warning"
          isOpen={shouldShowConfirmationModal}
          isDisabled={isDisabled}
          onCancel={dismissConfirmationModal}
          onConfirm={handleConfirm}
          onClose={dismissConfirmationModal}
        >
          <Content>
            <Content component="p" id="confirmation-modal-description">
              Are you sure you want to delete{" "}
              <b>{sourceName ? sourceName : "this environment"}</b>?
              <br />
              To use it again, create a new discovery image and redeploy it.
            </Content>
          </Content>
        </ConfirmationModal>
      )}
    </>
  );
}

RemoveSourceAction.displayName = "RemoveSourceAction";
