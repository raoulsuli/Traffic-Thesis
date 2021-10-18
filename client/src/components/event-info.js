import React from 'react';

function EventInfo(props) {
    return (
        <div className="container">
            <div className="row">
                <div className="col-12">Type: {props.event.eventType}</div>
            </div>
            <div className="row">
                <div className="col-12">Date: {props.event.date}</div>
            </div>
            <div className="row">
                <div className="col-12">speed: {props.event.speed} km/h</div>
            </div>
        </div>
    );
}

export default React.memo(EventInfo);