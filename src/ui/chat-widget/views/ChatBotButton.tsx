import { Button, Tooltip } from "@patternfly/react-core";
import React from "react";

import LightSpeedLogo from "../assets/lightspeed-logo.svg";
import { aiChatbotButton, chatBotButtonIcon } from "./styles";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ChatBotButton {
  export type Props = {
    isOpen: boolean;
    onClick: () => void;
  };
}

export const ChatBotButton: React.FC<ChatBotButton.Props> = ({
  isOpen,
  onClick,
}) => {
  return (
    <Tooltip content="AI assistants" position="left">
      <Button
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="ai-chatbot-panel"
        onClick={onClick}
        icon={
          <img
            src={LightSpeedLogo}
            alt="OpenShift Lightspeed"
            className={chatBotButtonIcon}
          />
        }
        variant="plain"
        className={aiChatbotButton}
      />
    </Tooltip>
  );
};

ChatBotButton.displayName = "ChatBotButton";
