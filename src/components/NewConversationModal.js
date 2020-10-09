import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useContacts } from "../contexts/ContactsProvider";
import { useConversations } from "../contexts/ConversationsProvider";

export default function NewConversationModal({ closeModal }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const { contacts } = useContacts();
  const { createConversations } = useConversations();

  function handleSubmit(e) {
    e.preventDefault();
    createConversations(selectedIds);
    closeModal();
  }

  function handleCheckboxChange(contactId) {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(contactId)) {
        return prevSelectedIds.filter((prevId) => {
          return contactId !== prevId;
        });
      } else {
        return [...prevSelectedIds, contactId];
      }
    });
  }
  return (
    <>
      <Modal.Header closeButton>Create Conversation</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {contacts.map((contact) => (
            <Form.Group controlId={contact.id} key={contact.id}>
              <Form.Check
                type="checkbox"
                value={selectedIds.includes(contact.id)}
                label={contact.name}
                onChange={() => {
                  handleCheckboxChange(contact.id);
                }}
              />
            </Form.Group>
          ))}
          <Button type="submit">Create</Button>
        </Form>
      </Modal.Body>
    </>
  );
}
