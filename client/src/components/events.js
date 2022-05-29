import React, { useState, useEffect } from "react";
import { Marker } from "react-map-gl";
import { BsFillRecordCircleFill } from "react-icons/bs";
import utils from "../constants/utils";
import { FaCarSide } from "react-icons/fa";

const eventColors = {
  Police: "blue",
  Accident: "red",
  "Traffic Jam": "orange",
  Construction: "yellow",
};

const BOTS_NUMBER = 3;

const randomSignValue = () => 0.0003 * (Math.round(Math.random()) * 2 - 1);

const randomDecimalValue = () => Math.random() * 0.0075 - 0.0035;

const assignCars = (cars, initial) => {
  if (initial) {
    for (let i = 0; i < BOTS_NUMBER; i++) {
      cars.push({ x: randomDecimalValue(), y: randomDecimalValue() });
    }
  } else {
    for (let i = 0; i < BOTS_NUMBER; i++) {
      cars[i] = {
        x: cars[i].x + randomSignValue(),
        y: cars[i].y + randomSignValue(),
      };
    }
  }
};

export default function Events(props) {
  const [bots, setBots] = useState([]);
  let triggerCount = 0;

  const createEvent = async (position) => {
    await fetch(`${utils.API_PATH}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: props.account,
        longitude: position.longitude,
        latitude: position.latitude,
        type: Object.keys(eventColors)[Math.floor(Math.random() * 3)],
        date: new Date(),
        speed: Math.floor(Math.random() * 50),
      }),
    }).then(() => props.refresh());
  };

  const events = React.useMemo(
    () => [
      ...props.events.map((event, index) => (
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
      ...props.requests.map(
        (event, index) =>
          event.status === utils.PENDING && (
            <Marker
              key={`event-r-${index}`}
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
    ],
    [props]
  );

  useEffect(() => {
    const { latitude, longitude } = props.position;
    let carCoordinates = [];
    assignCars(carCoordinates, true);

    const updateBots = setInterval(() => {
      const currentBots = [];
      assignCars(carCoordinates, false);

      for (let i = 0; i < BOTS_NUMBER; i++) {
        currentBots.push(
          <Marker
            key={`car${i}`}
            longitude={longitude + carCoordinates[i].x}
            latitude={latitude + carCoordinates[i].y}
          >
            <FaCarSide
              style={{
                color: "black",
                width: "20px",
              }}
            />
          </Marker>
        );
      }

      setBots(currentBots);
      triggerCount++;
      if (triggerCount === 15) {
        triggerCount = 0;
        const b = currentBots[Math.floor(Math.random() * (BOTS_NUMBER - 1))];
        createEvent({
          longitude: b.props.longitude,
          latitude: b.props.latitude,
        });
      }
    }, 2000);

    return () => clearInterval(updateBots);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [...events, ...bots];
}
