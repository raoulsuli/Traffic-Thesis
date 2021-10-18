import React, {useEffect, useState} from 'react';
import ReactMapGL, { GeolocateControl, Popup } from 'react-map-gl';
import EventInfo from './event-info';
import Events from './events';
import Button from 'react-bootstrap/Button';
import { BsPlusLg } from 'react-icons/bs';

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
        //update in db
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
      
      </ReactMapGL>
      <Button className="rounded-circle d-flex p-3" variant="info" style={{position: 'absolute', right: 30, bottom: 50}}><BsPlusLg size={40}/> </Button>
    </>
    );
}