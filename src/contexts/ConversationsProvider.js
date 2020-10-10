import React, { useContext, useState, useEffect, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useContacts } from "./ContactsProvider";
import { arrayEquality } from "../helper";
import { useSocket } from "./SocketProvider";

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
  const socket = useSocket();

  const createConversations = (recipients) => {
    setConversations((prevConversations) => {
      return [...prevConversations, { recipients, messages: [] }];
    });
  };

  const addMessageToConversation = useCallback(
    ({ recipients, text, sender }) => {
      setConversations(
        (prevConversations) => {
          let madeChange = false;
          const newMessage = { sender, text };
          const newConversations = prevConversations.map((conversation) => {
            // console.log("CON", conversation.recipients);
            // console.log("INPUT", recipients);
            // console.log(arrayEquality(conversation.recipients, recipients));
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
            return [
              ...prevConversations,
              { recipients, messages: [newMessage] },
            ];
          }
        },
        [setConversations]
      );
    },
    [setConversations]
  );

  useEffect(() => {
    if (socket == null) {
      return;
    }
    socket.on("receive-msg", addMessageToConversation);
    return () => {
      socket.off("receive-msg");
    };
  }, [socket, addMessageToConversation]);

  const sendMessage = (recipients, text) => {
    socket.emit("send-msg", { recipients, text });
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
      const contact = contacts.find((contact) => {
        return contact.id === msg.sender;
      });
      const name = (contact && contact.name) || msg.sender;
      const byMe = id === msg.sender;
      return { ...msg, senderName: name, byMe };
    });
    // console.log(con);
    const selected = index === selectedConversationIndex;
    return { ...con, messages, recipients, selected };
  });

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectedConversationIndex: setSelectedConversationIndex,
    createConversations,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}
