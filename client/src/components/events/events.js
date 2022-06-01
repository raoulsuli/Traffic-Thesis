import React, { useState, useEffect } from "react";
import { PENDING, httpRequest, BOTS_NUMBER } from "../../constants/utils";
import {
  eventColors,
  assignCars,
  generateMarkerEvent,
  generateMarkerBot,
} from "./events.config";

export default function Events(props) {
  const [bots, setBots] = useState([]);

  const createBotEvent = async (position) => {
    await httpRequest("/request", "POST", {
      address: props.account,
      longitude: position.longitude,
      latitude: position.latitude,
      type: Object.keys(eventColors)[Math.floor(Math.random() * 3)],
      date: new Date(),
      speed: Math.floor(Math.random() * 50),
    })
      .then(() => props.refresh())
      .catch(() => {});
  };

  const events = React.useMemo(
    () => [
      ...props.events.map((event, index) =>
        generateMarkerEvent(index, event, props.onClick)
      ),
      ...props.requests.map(
        (event, index) =>
          event.status === PENDING &&
          generateMarkerEvent(`r-${index}`, event, props.onClick)
      ),
    ],
    [props]
  );

  useEffect(() => {
    if (BOTS_NUMBER !== 0 && props.botsActivated) {
      const { latitude, longitude } = props.position;
      let carCoordinates = [];
      let triggerCount = 0;

      assignCars(carCoordinates, true);

      const updateBots = setInterval(() => {
        const currentBots = [];
        assignCars(carCoordinates, false);

        for (let i = 0; i < BOTS_NUMBER; i++) {
          currentBots.push(
            generateMarkerBot(
              i,
              longitude + carCoordinates[i].x,
              latitude + carCoordinates[i].y
            )
          );
        }

        setBots(currentBots);
        triggerCount++;

        if (triggerCount === 15) {
          triggerCount = 0;
          const b = currentBots[Math.floor(Math.random() * (BOTS_NUMBER - 1))];

          createBotEvent({
            longitude: b.props.longitude,
            latitude: b.props.latitude,
          });
        }
      }, 2000);

      return () => clearInterval(updateBots);
    } else setBots([]);
  }, [props.botsActivated]); // eslint-disable-line react-hooks/exhaustive-deps

  return [...events, ...bots];
}
