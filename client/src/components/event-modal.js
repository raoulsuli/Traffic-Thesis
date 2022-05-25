import React, { useEffect, useState } from "react";
import { BsPlusLg } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { getDistance } from "../constants/utils";

export default function EventModal(props) {
  const [modal, setModal] = useState(false);
  const [eventType, setEventType] = useState("Traffic Jam");
  const [btnDisabled, setBtnDisabled] = useState(false);

  function handleClick() {
    props.onClick(eventType);
    setModal(false);
  }

  function isHidden() {
    return props.events.some(
      (ev) =>
        getDistance(
          props.position.latitude,
          props.position.longitude,
          ev.latitude,
          ev.longitude
        ) < 0.5
    );
  }

  useEffect(() => {
    if (isHidden()) setBtnDisabled(true);
    else setBtnDisabled(false);
  }, []);

  return (
    <>
      <Button
        className="rounded-circle d-flex p-3"
        variant="info"
        onClick={() => setModal(true)}
        style={{ position: "absolute", right: 30, bottom: 50, color: "white" }}
      >
        <BsPlusLg size={40} />
      </Button>
      <Modal show={modal} onHide={() => setModal(false)} animation="false">
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
          <p className="pb-2 text-danger fw-bold">
            An event is already happening in your area!
          </p>
          <Button
            className="w-50"
            variant="success"
            onClick={handleClick}
            disabled={btnDisabled}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
