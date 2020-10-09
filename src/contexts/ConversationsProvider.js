import React, { useContext, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useContacts } from "./ContactsProvider";
import { arrayEquality } from "../helper";

const ConversationsContext = React.createContext();

export function useConversations() {
  return useContext(ConversationsContext);
}

export function ConversationsProvider({ id, children }) {
  const [conversations, setConversations] = useLocalStorage(
    "conversations",
    []
  );
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0);

  const { contacts } = useContacts();
  const createConversations = (recipients) =>
    setConversations((prevConversations) => [
      ...prevConversations,
      { recipients, messages: [] },
    ]);

  function addMessageToConversation({ recipients, text, sender }) {
    setConversations((prevConversations) => {
      let madeChange = false;
      const newMessage = { sender, text };
      const newConversations = prevConversations.map((conversation) => {
        if (arrayEquality(conversation.recipients, recipients)) {
          madeChange = true;
          return {
            ...conversation,
            messages: [...conversation.messages, newMessage],
          };
        }
        return conversation;
      });
      if (madeChange) {
        return newConversations;
      } else {
        return [...prevConversations, { recipients, messages: [newMessage] }];
      }
    });
  }

  const sendMessage = (recipients, text) => {
    addMessageToConversation({ recipients, text, sender: id });
  };

  const formattedConversations = conversations.map((con, index) => {
    const recipients = con.recipients.map((recipient) => {
      const contact = contacts.find((contact) => {
        return contact.id === recipient;
      });

      const name = (contact && contact.name) || recipient;
      // console.log(name);
      return { id: recipient, name };
    });

    const messages = con.messages.map((msg) => {
      const contact = contacts.find((contact) => contact.id === msg.sender);
      const name = (contact && contact.name) || msg.sender;
      const byMe = id === msg.sender;
      return { ...msg, senderName: name, byMe };
    });
    // console.log(con);
    const selected = index === selectedConversationIndex;
    return { ...con, recipients, messages, selected };
  });

  const value = {
    conversations: formattedConversations,
    createConversations,
    selectedConversationIndex: setSelectedConversationIndex,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}
