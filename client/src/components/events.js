import React from 'react';
import { Marker } from 'react-map-gl';
import { BsCircleFill } from "react-icons/bs";

export default function Events(props) {
  const events = React.useMemo(() => props.events.map(
    (event, index) => (
      <Marker key={`event-${index}`} longitude={event.longitude} latitude={event.latitude} >
        <BsCircleFill style={{color: 'red', cursor: 'pointer'}} onClick={() => props.onClick(event)}/>
      </Marker>
    )
  ), [props]);

  return events;
}