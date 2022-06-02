import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { getDistance } from "../constants/utils";

function EventInfo(props) {
  const [hidden, setHidden] = useState(false);

  function handleClick(answer) {
    props.onClick({ answer: answer, id: props.event._id });
    setHidden(true);
  }

  function isHidden() {
    const distance = getDistance(
      props.position.latitude,
      props.position.longitude,
      props.event.latitude,
      props.event.longitude
    );

    const isNotAnswered =
      props.event.answered &&
      !props.event.answered.some((o) => o.address === props.account);

    if (props.event.reputation && !hidden && isNotAnswered && distance < 0.5) {
      return true;
    }

    return false;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">Type: {props.event.eventType}</div>
      </div>
      <div className="row">
        <div className="col-12">
          Date: {new Date(props.event.date).toLocaleString("uk-Uk")}
        </div>
      </div>
      <div className="row">
        <div className="col-12">Speed: {props.event.speed} km/h</div>
      </div>
      {isHidden() && (
        <div className="row mt-2">
          <div className="col-12 d-flex justify-content-center">
            <Button
              className="me-2"
              size="sm"
              variant="success"
              onClick={() => handleClick(true)}
            >
              Confirm
            </Button>
            <Button
              className="ms-2"
              size="sm"
              variant="danger"
              onClick={() => handleClick(false)}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(EventInfo);
