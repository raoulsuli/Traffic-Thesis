import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import { Marker } from "react-map-gl";
import { FaCarSide } from "react-icons/fa";
import { addAnswer, addRequest } from "../utils/http";
import { canAddEvent, canAnswerEvent, EVENT_COLORS } from "../utils/constants";

const BOTS_NUMBER = 8;
const BOTS_REFRESH_RATE = 3 * 1000;

const randomSignValue = () => {
  return 0.0004 * (Math.round(Math.random()) * 2 - 1);
};

const randomDecimalValue = () => {
  return Math.random() * 0.01 - 0.0035;
};

export const Bots = ({ position, requests, events, refresh }) => {
  const [bots, setBots] = useState([]);
  const [botsActivated, setBotsActivated] = useState(false);

  const botsInterval = useRef(null);
  const eventInteractionInterval = useRef(0);

  const localRequests = useRef([...requests]);
  const localEvents = useRef([...events]);

  const handleBots = () => {
    const { latitude, longitude } = position;
    const cars = bots.length === 0 ? [] : bots;

    for (let i = 0; i < BOTS_NUMBER; i++) {
      if (bots.length === 0) {
        cars.push({
          address: `bot-${i}`,
          latitude: latitude + randomDecimalValue(),
          longitude: longitude + randomDecimalValue(),
        });
      } else {
        cars[i] = {
          latitude: cars[i].latitude + randomSignValue(),
          longitude: cars[i].longitude + randomSignValue(),
        };
      }
    }

    eventInteractionInterval.current++;
    if (eventInteractionInterval.current === 5) {
      publishEvent(cars);
      answerEvents(cars);
      eventInteractionInterval.current = 0;
    }

    setBots(cars);
  };

  const publishEvent = (cars) => {
    const bot = cars[Math.floor(Math.random() * BOTS_NUMBER)];
    const { address, latitude, longitude } = bot;

    const eventType = Object.keys(EVENT_COLORS)[Math.floor(Math.random() * 4)];

    const reqs = localRequests.current;
    const evs = localEvents.current;

    if (canAddEvent([...reqs, ...evs], latitude, longitude, eventType)) {
      addRequest({
        address: address,
        latitude: latitude,
        longitude: longitude,
        eventType: eventType,
        date: new Date(),
        speed: Math.floor(Math.random() * 50),
      }).then(() => refresh());
    }
  };

  const answerEvents = (cars) => {
    cars.forEach(({ address, latitude, longitude }) => {
      localRequests.current.forEach((request) => {
        const { _id, answered } = request;

        const differentOwner = address !== request.address;
        const canAnswer = canAnswerEvent(
          latitude,
          longitude,
          request.latitude,
          request.longitude,
          answered,
          address,
          false
        );

        if (differentOwner && canAnswer)
          addAnswer({
            id: _id,
            address: address,
            answer: Math.random() < 0.5,
          }).then(() => refresh());
      });
    });
  };

  useEffect(() => {
    if (botsActivated) {
      handleBots();
      botsInterval.current = setInterval(() => handleBots(), BOTS_REFRESH_RATE);
    } else {
      setBots([]);
      clearInterval(botsInterval.current);
    }

    return () => clearInterval(botsInterval.current);
  }, [botsActivated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localRequests.current = [...requests];
  }, [requests]);

  useEffect(() => {
    localEvents.current = [...events];
  }, [events]);

  return (
    <>
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

      {bots.map(({ latitude, longitude }, index) => {
        return (
          <Marker
            key={`car-${index}`}
            latitude={latitude}
            longitude={longitude}
          >
            <FaCarSide style={{ color: "black", width: "20px" }} />
          </Marker>
        );
      })}
    </>
  );
};
