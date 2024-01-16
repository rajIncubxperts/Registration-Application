import React, { useState, ReactNode } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface CustomModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, closeModal, title, children, onConfirm }) => {
  const [validated, setValidated] = useState(false);

  const handleConfirm = () => {
    setValidated(true);
    // Perform additional validation if needed
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
          Confirm
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;



