import React, { useState, ReactNode } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface CustomModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  selectedFamilyMembers?: any;
  children: ReactNode;
  onConfirm: () => void;
  action:string
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  closeModal,
  title,
  children,
  selectedFamilyMembers,
  action,
  onConfirm,
}) => {
  const [validated, setValidated] = useState(false);
  console.log("studentId", selectedFamilyMembers);

  const handleConfirm = () => {
    setValidated(true);
    if (!validated) return;
    onConfirm();
    closeModal();
  };

  return (
    <Modal show={isOpen} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated}>
          {children}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm}>
          {action === "add" ? "Update" : "Add"}
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
