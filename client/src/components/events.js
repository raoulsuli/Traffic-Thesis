import React from "react";
import { Marker } from "react-map-gl";
import { BsFillRecordCircleFill } from "react-icons/bs";
import utils from "../constants/utils";

const eventColors = {
  Police: "blue",
  Accident: "red",
  "Traffic Jam": "orange",
  Construction: "yellow",
};

export default function Events(props) {
  const events = React.useMemo(
    () =>
      props.events.map((event, index) => (
        <Marker
          key={`event-${index}`}
          longitude={event.longitude}
          latitude={event.latitude}
        >
          <BsFillRecordCircleFill
            style={{ color: eventColors[event.eventType], cursor: "pointer" }}
            onClick={() => props.onClick(event)}
          />
        </Marker>
      )),
    [props]
  );

  events.push(
    React.useMemo(
      () =>
        props.requests.map(
          (event, index) =>
            event.status === utils.PENDING && (
              <Marker
                key={`event-${index}`}
                longitude={event.longitude}
                latitude={event.latitude}
              >
                <BsFillRecordCircleFill
                  style={{
                    color: eventColors[event.eventType],
                    cursor: "pointer",
                  }}
                  onClick={() => props.onClick(event)}
                />
              </Marker>
            )
        ),
      [props]
    )
  );

  return events;
}
