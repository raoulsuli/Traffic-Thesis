import { Marker } from "react-map-gl";
import { EVENT_COLORS } from "../utils/constants";
import { BsFillRecordCircleFill } from "react-icons/bs";

export const Events = ({ events, setEventInfo }) => {
  return (
    <>
      {events
        .filter(({ latitude, longitude }) => {
          return Number.isFinite(latitude) && Number.isFinite(longitude);
        })
        .map((event, index) => {
          const { latitude, longitude, eventType } = event;

          return (
            <Marker
              key={`event-${index}`}
              latitude={latitude}
              longitude={longitude}
            >
              <BsFillRecordCircleFill
                style={{ color: EVENT_COLORS[eventType], cursor: "pointer" }}
                onClick={() => setEventInfo(event)}
              />
            </Marker>
          );
        })}
    </>
  );
};
