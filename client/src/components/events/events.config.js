import { Marker } from "react-map-gl";
import { BsFillRecordCircleFill } from "react-icons/bs";
import { FaCarSide } from "react-icons/fa";
import { BOTS_NUMBER } from "../../constants/utils";

const eventColors = {
  Police: "blue",
  Accident: "red",
  "Traffic Jam": "orange",
  Construction: "yellow",
};

function randomSignValue() {
  return 0.0003 * (Math.round(Math.random()) * 2 - 1);
}

function randomDecimalValue() {
  return Math.random() * 0.0075 - 0.0035;
}

function assignCars(cars, initial) {
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
}

function generateMarkerEvent(key, event, onClick) {
  const { longitude, latitude, eventType } = event;

  return (
    <Marker key={`event-${key}`} longitude={longitude} latitude={latitude}>
      <BsFillRecordCircleFill
        style={{ color: eventColors[eventType], cursor: "pointer" }}
        onClick={() => onClick(event)}
      />
    </Marker>
  );
}

function generateMarkerBot(index, longitude, latitude) {
  return (
    <Marker key={`car${index}`} longitude={longitude} latitude={latitude}>
      <FaCarSide
        style={{
          color: "black",
          width: "20px",
        }}
      />
    </Marker>
  );
}

export { eventColors, assignCars, generateMarkerEvent, generateMarkerBot };
