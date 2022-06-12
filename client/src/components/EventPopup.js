import { useEffect, useState } from "react";
import { Popup } from "react-map-gl";
import Button from "react-bootstrap/Button";

import { canAnswerEvent } from "../utils/constants";
import { addAnswer } from "../utils/http";

export const EventPopup = ({ position, event, address, onClose, refresh }) => {
  const [hidden, setHidden] = useState(false);

  const { _id, latitude, longitude, eventType, date, speed, answered } = event;

  const isNotHidden = () => {
    return canAnswerEvent(
      position.latitude,
      position.longitude,
      latitude,
      longitude,
      answered,
      address,
      hidden
    );
  };

  const answerEvent = async (answer) => {
    await addAnswer({ id: _id, address: address, answer: answer });
    setHidden(true);
    refresh();
  };

  useEffect(() => setHidden(!isNotHidden()), [position, event]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Popup
      tipSize={5}
      anchor="top"
      latitude={latitude}
      longitude={longitude}
      closeButton={false}
      onClose={onClose}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">Type: {eventType}</div>
        </div>
        <div className="row">
          <div className="col-12">
            Date: {new Date(date).toLocaleString("uk-Uk")}
          </div>
        </div>
        <div className="row">
          <div className="col-12">Speed: {speed} km/h</div>
        </div>
        {!hidden && isNotHidden() && (
          <div className="row mt-2">
            <div className="col-12 d-flex justify-content-center">
              <Button
                className="me-2"
                size="sm"
                variant="success"
                onClick={() => answerEvent(true)}
              >
                Confirm
              </Button>
              <Button
                className="ms-2"
                size="sm"
                variant="danger"
                onClick={() => answerEvent(false)}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </Popup>
  );
};
