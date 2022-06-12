import { useState, useEffect } from "react";
import ReactMapGL, { GeolocateControl } from "react-map-gl";

import { getRequests } from "../utils/http";
import { Events } from "./Events";
import { EventAdd } from "./EventAdd";
import { EventPopup } from "./EventPopup";
import {
  EVENT_REFRESH_RATE,
  STATUS_CODES,
  deleteEvent,
  updateBlockchain,
} from "../utils/constants";
import { Bots } from "./Bots";

const EVENT_EXPIRE_RATES = {
  Accident: 30 * 60 * 1000,
  Police: 20 * 60 * 1000,
  "Traffic Jam": 60 * 60 * 1000,
  Construction: 120 * 60 * 1000,
};

const REQUEST_EXPIRE_RATE = 5 * 60 * 1000;

export const Map = ({ address, contract }) => {
  const [position, setPosition] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const resizeFunction = () => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
  };

  const fetchRequests = () => {
    getRequests().then((response) => {
      const pendingRequests = response.data.filter(
        (req) => req.status === STATUS_CODES.PENDING
      );

      pendingRequests.forEach((request) => {
        let date = new Date(request.date);
        date = new Date(date.getTime() + REQUEST_EXPIRE_RATE);

        if (new Date() >= date) {
          updateBlockchain(request, contract, address);
          setEventInfo(null);
        }
      });

      setRequests(pendingRequests);
    });
  };

  const fetchEvents = async () => {
    const eventCount = await contract.methods.eventCount().call();
    const events = [];

    for (let i = 0; i < eventCount; i++) {
      const ev = await contract.methods.getEvent(i).call();
      const { id, date, eventType, latitude, longitude, speed } = ev;

      let newDate = new Date(date);
      newDate = new Date(newDate.getTime() + EVENT_EXPIRE_RATES[ev.eventType]);

      if (new Date() >= newDate) {
        deleteEvent(ev, contract, address, fetchRequests);
        setEventInfo(null);
      } else {
        events.push({
          id: id,
          date: date,
          eventType: eventType,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: speed,
        });
      }
    }

    setEvents(events);
  };

  const fetchData = () => {
    fetchRequests();
    fetchEvents();
  };

  useEffect(() => {
    window.addEventListener("resize", resizeFunction);

    return () => window.removeEventListener("resize", resizeFunction);
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => fetchData(), EVENT_REFRESH_RATE);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoicmFvdWxzdWxpIiwiYSI6ImNsNDczNXAxczBlaGUzbm1zaGh4cWk4dWQifQ.D7SId69HtWECO--dXdKoig"
        onViewportChange={(viewport) => setViewport(viewport)}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        <GeolocateControl
          auto
          style={{ right: 10, top: 10 }}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onGeolocate={(pos) => {
            const { latitude, longitude, speed } = pos.coords;

            setPosition({
              latitude: latitude,
              longitude: longitude,
              speed: speed ?? 0,
            });
          }}
        />

        {position && (
          <Events
            events={[...events, ...requests]}
            setEventInfo={setEventInfo}
          />
        )}

        {eventInfo && (
          <EventPopup
            position={position}
            event={eventInfo}
            address={address}
            onClose={() => setEventInfo(null)}
            refresh={fetchData}
          />
        )}

        {position && (
          <Bots
            position={position}
            requests={requests}
            events={events}
            refresh={fetchData}
          />
        )}
      </ReactMapGL>

      {position && (
        <EventAdd
          position={position}
          events={[...events, ...requests]}
          address={address}
          refresh={fetchData}
        />
      )}
    </>
  );
};
