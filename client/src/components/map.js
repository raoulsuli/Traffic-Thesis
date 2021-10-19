import React, {useEffect, useState} from 'react';
import ReactMapGL, { GeolocateControl, Popup } from 'react-map-gl';
import EventInfo from './event-info';
import Events from './events';
import EventModal from './event-modal';

export default function Map(props) {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [eventInfo, setEventInfo] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    window.addEventListener('resize', () => setViewport({width: window.innerWidth, height: window.innerHeight}));
    return () => window.removeEventListener('resize', () => setViewport({width: window.innerWidth, height: window.innerHeight}));
  }, []);

  function updatePosition(position) {
    setPosition(position);
  }

  async function createEvent(eventType) {
    await props.contract.methods.createEvent(eventType, getCurrentDate(), position.longitude.toString(), position.latitude.toString(), position.speed * 3.6).send({from: props.account});
    await props.refreshEvents();
  }
  
  return (
  <>
    <ReactMapGL
    {...viewport}
    mapboxApiAccessToken="pk.eyJ1IjoicmFvdWxzdWxpIiwiYSI6ImNrdXFvdG1ocDE0YmUyb3FyZTJ3YnFvaWkifQ.ggE3-QrZyztX66PsodWWSA"
    onViewportChange={(viewport) => setViewport(viewport)}
    >
      <GeolocateControl
      style={{right: 10, top: 10}}
      positionOptions={{enableHighAccuracy: true}}
      trackUserLocation={true}
      onGeolocate={(pos) => updatePosition(pos.coords)}
      auto/>

      <Events events={props.events} onClick={setEventInfo}/>
      
      {eventInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={eventInfo.longitude}
          latitude={eventInfo.latitude}
          closeButton={false}
          onClose={setEventInfo}
        >
          <EventInfo event={eventInfo} />
        </Popup>
      )}

      <EventModal onClick={createEvent}/>
    </ReactMapGL>
  </>
  );
}

function getCurrentDate() {
  const today = new Date();
  const formatDate = (item) => {
      return (item <= 9) ? `0${item}` : item;
  }

  return formatDate(today.getDay()) + '/' + formatDate(today.getMonth()) + '/' +
  today.getFullYear() + ', ' + formatDate(today.getHours()) + ':' +
  formatDate(today.getMinutes()) + ':' + formatDate(today.getSeconds());
}