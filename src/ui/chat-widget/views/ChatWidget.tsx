import "@patternfly/chatbot/dist/css/main.css";

import {
  Chatbot,
  ChatbotAlert,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderCloseButton,
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderTitle,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from "@patternfly/chatbot";
import { Brand } from "@patternfly/react-core";
import React, { useCallback, useEffect, useRef } from "react";

import LightSpeedLogo from "../assets/lightspeed-logo.svg";
import UserAvatar from "../assets/user-avatar.svg";
import { useChatWidgetViewModel } from "../view-models/useChatWidgetViewModel";
import { ChatBotButton } from "./ChatBotButton";
import { ChatBotHistory } from "./ChatBotHistory";
import {
  aiChatbot,
  aiChatbotBrand,
  pfChatbot,
  pfChatbotMessageAndActions,
} from "./styles";

export const ChatWidget: React.FC = () => {
  const vm = useChatWidgetViewModel();
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const msgBarRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [vm.messages, vm.isStreaming, vm.isLoading]);

  useEffect(() => {
    if (vm.isOpen) {
      requestAnimationFrame(() => msgBarRef.current?.focus());
    }
  }, [vm.isOpen]);

  const handleSendMessage = useCallback(() => {
    if (vm.inputValue.trim()) {
      void vm.sendMessage();
    }
  }, [vm]);

  const isProcessing = vm.isStreaming || vm.isLoading;

  return (
    <div className={aiChatbot}>
      <ChatBotButton isOpen={vm.isOpen} onClick={vm.toggleDrawer} />
      {vm.isOpen && (
        <Chatbot displayMode={ChatbotDisplayMode.default} className={pfChatbot}>
          <ChatBotHistory
            isOpen={vm.isHistoryOpen}
            setIsOpen={vm.setHistoryOpen}
            conversationId={vm.conversationId}
            startNewConversation={vm.startNewConversation}
            loadConversation={vm.loadConversation}
          >
            <ChatbotHeader>
              <ChatbotHeaderMain>
                <ChatbotHeaderMenu
                  aria-label="Toggle conversation history"
                  onMenuToggle={() => vm.setHistoryOpen(!vm.isHistoryOpen)}
                />
                <ChatbotHeaderTitle className={aiChatbotBrand}>
                  <Brand
                    src={LightSpeedLogo}
                    alt="OpenShift Lightspeed"
                    style={{ height: 46, width: 46, maxHeight: 46 }}
                  />
                </ChatbotHeaderTitle>
              </ChatbotHeaderMain>
              <ChatbotHeaderActions>
                <ChatbotHeaderCloseButton onClick={vm.closeDrawer} />
              </ChatbotHeaderActions>
            </ChatbotHeader>
            <ChatbotContent>
              <MessageBox position="top">
                {vm.messages.length === 0 && (
                  <ChatbotWelcomePrompt
                    title="Hi there!"
                    description="How can I help you with your migration assessment today?"
                  />
                )}
                {vm.messages.map((message, index) => {
                  const isLastBotMessage =
                    index === vm.messages.length - 1 &&
                    message.role === "assistant";
                  const showLoading =
                    isLastBotMessage && vm.isStreaming && !message.content;

                  return (
                    <Message
                      key={`${vm.conversationId ?? "new"}-${message.id}`}
                      role={message.role === "user" ? "user" : "bot"}
                      name={message.role === "user" ? "You" : "AI Assistant"}
                      content={message.content}
                      avatar={
                        message.role === "assistant"
                          ? LightSpeedLogo
                          : UserAvatar
                      }
                      isLoading={showLoading}
                      className={pfChatbotMessageAndActions}
                    />
                  );
                })}
                {vm.error && (
                  <ChatbotAlert
                    variant="danger"
                    onClose={vm.clearError}
                    title="An error occurred"
                  >
                    {vm.error}
                  </ChatbotAlert>
                )}
                <div ref={scrollToBottomRef} />
              </MessageBox>
            </ChatbotContent>
            <ChatbotFooter>
              <MessageBar
                onSendMessage={handleSendMessage}
                isSendButtonDisabled={isProcessing || !vm.inputValue.trim()}
                hasAttachButton={false}
                onChange={(_, value) => vm.setInputValue(`${value}`)}
                ref={msgBarRef}
              />
              <ChatbotFootnote label="Always review AI generated content prior to use" />
            </ChatbotFooter>
          </ChatBotHistory>
        </Chatbot>
      )}
    </div>
  );
};

ChatWidget.displayName = "ChatWidget";
