import {
  ChatbotConversationHistoryNav,
  ChatbotDisplayMode,
  type Conversation,
} from "@patternfly/chatbot";
import { Alert, MenuItemAction } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import React from "react";

import { useChatBotHistoryViewModel } from "../view-models/useChatBotHistoryViewModel";
import { DeleteConversationModal } from "./DeleteConversationModal";

interface ChatBotHistoryProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  startNewConversation: (closeDrawer?: boolean) => void;
  loadConversation: (id: string) => Promise<void>;
  conversationId?: string;
  children: React.ReactNode;
}

export const ChatBotHistory: React.FC<ChatBotHistoryProps> = ({
  isOpen,
  setIsOpen,
  children,
  conversationId,
  startNewConversation,
  loadConversation,
}) => {
  const vm = useChatBotHistoryViewModel({
    isOpen,
    conversationId,
    startNewConversation,
  });

  return (
    <>
      <ChatbotConversationHistoryNav
        setIsDrawerOpen={setIsOpen}
        isDrawerOpen={isOpen}
        drawerContent={children}
        displayMode={ChatbotDisplayMode.default}
        onDrawerToggle={() => setIsOpen(!isOpen)}
        isLoading={vm.isLoading}
        conversations={vm.conversations.map<Conversation>((c) => ({
          ...c,
          additionalProps: {
            actions: (
              <MenuItemAction
                icon={<TrashAltIcon />}
                actionId="delete"
                onClick={() => vm.requestDelete(c.id)}
                aria-label={`Delete conversation from ${c.text}`}
              />
            ),
          },
        }))}
        onNewChat={() => {
          startNewConversation(true);
          setIsOpen(false);
        }}
        onSelectActiveItem={(_, itemId) => {
          if (itemId !== undefined) {
            void loadConversation(`${itemId}`);
          }
          setIsOpen(false);
        }}
        activeItemId={conversationId}
        errorState={
          vm.error
            ? {
                bodyText: (
                  <Alert
                    variant="danger"
                    isInline
                    title="Failed to load conversation history"
                  >
                    {vm.error}
                  </Alert>
                ),
              }
            : undefined
        }
        emptyState={
          !vm.isLoading && !vm.conversations.length
            ? { bodyText: "No conversation history" }
            : undefined
        }
      />
      {vm.deleteConversationId && vm.conversationToDelete && (
        <DeleteConversationModal
          conversation={vm.conversationToDelete}
          onClose={vm.cancelDelete}
          onDelete={vm.confirmDelete}
        />
      )}
    </>
  );
};
