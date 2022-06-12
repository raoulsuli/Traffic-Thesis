import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BsPlusLg } from "react-icons/bs";

import { canAddEvent } from "../utils/constants";
import { addRequest } from "../utils/http";

export const EventAdd = ({ position, events, address, refresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventType, setEventType] = useState("Traffic Jam");
  const [btnDisabled, setBtnDisabled] = useState(false);

  const { latitude, longitude, speed } = position;

  const isDisabled = () => {
    return !canAddEvent(events, latitude, longitude, eventType);
  };

  const addEvent = async () => {
    await addRequest({
      address: address,
      eventType: eventType,
      latitude: latitude,
      longitude: longitude,
      date: new Date(),
      speed: speed * 3.6,
    });

    setModalOpen(false);
    refresh();
  };

  useEffect(() => setBtnDisabled(isDisabled()), [events, eventType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Button
        className="rounded-circle p-3 text-white position-absolute"
        variant="info"
        onClick={() => setModalOpen(true)}
        style={{ right: 30, bottom: 50 }}
      >
        <BsPlusLg size={40} />
      </Button>
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        animation="false"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add a new event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Select event type</Form.Label>
          <Form.Select
            aria-label="Select event type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="Traffic Jam">Traffic Jam</option>
            <option value="Accident">Accident</option>
            <option value="Construction">Construction</option>
            <option value="Police">Police</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          {btnDisabled && (
            <p className="pb-2 text-danger fw-bold">
              An event is already happening in your area!
            </p>
          )}
          <Button
            className="w-50"
            variant="success"
            onClick={addEvent}
            disabled={btnDisabled}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
