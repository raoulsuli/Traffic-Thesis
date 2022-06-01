import React, { useEffect, useState } from "react";
import ReactMapGL, { GeolocateControl, Popup } from "react-map-gl";
import EventInfo from "./event-info";
import Events from "./events/events";
import EventModal from "./event-modal";
import { httpRequest } from "../constants/utils";
import Button from "react-bootstrap/Button";

export default function Map(props) {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [eventInfo, setEventInfo] = useState(null);
  const [position, setPosition] = useState(null);
  const [botsActivated, setBotsActivated] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    );
    return () =>
      window.removeEventListener("resize", () =>
        setViewport({ width: window.innerWidth, height: window.innerHeight })
      );
  }, []);

  async function updatePosition(position) {
    setPosition(position);
    await httpRequest("/location", "POST", {
      address: props.account,
      longitude: position.longitude,
      latitude: position.latitude,
    }).then(() => {});
  }

  async function createEvent(eventType) {
    await httpRequest("/request", "POST", {
      address: props.account,
      longitude: position.longitude,
      latitude: position.latitude,
      type: eventType,
      date: new Date(),
      speed: position.speed * 3.6,
    })
      .then(() => props.refresh())
      .catch(() => {});
  }

  async function updateRequest(answer) {
    await httpRequest("/request", "PUT", {
      id: answer.id,
      answered: {
        address: props.account,
        answer: answer.answer,
      },
    }).then(() => {});
  }

  return (
    <>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoicmFvdWxzdWxpIiwiYSI6ImNrdXFvdG1ocDE0YmUyb3FyZTJ3YnFvaWkifQ.ggE3-QrZyztX66PsodWWSA"
        onViewportChange={(viewport) => setViewport(viewport)}
      >
        <GeolocateControl
          style={{ right: 10, top: 10 }}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onGeolocate={(pos) => updatePosition(pos.coords)}
          auto
        />

        {position && (
          <Events
            events={props.events}
            position={position}
            requests={props.requests}
            onClick={setEventInfo}
            refresh={props.refresh}
            account={props.account}
            botsActivated={botsActivated}
          />
        )}

        {eventInfo && (
          <Popup
            tipSize={5}
            anchor="top"
            longitude={eventInfo.longitude}
            latitude={eventInfo.latitude}
            closeButton={false}
            onClose={setEventInfo}
          >
            <EventInfo
              event={eventInfo}
              position={position}
              account={props.account}
              onClick={updateRequest}
            />
          </Popup>
        )}

        <Button
          variant="secondary"
          className="text-white position-absolute"
          onClick={() => setBotsActivated((prev) => !prev)}
          style={{
            left: 8,
            bottom: 38,
            fontSize: "12px",
          }}
        >
          Activate/Deactivate Bots
        </Button>

        {position && (
          <EventModal
            events={[...props.events, ...props.requests]}
            position={position}
            onClick={createEvent}
          />
        )}
      </ReactMapGL>
    </>
  );
}
