import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import utils from '../constants/utils';

function EventInfo(props) {
    const [hidden, setHidden] = useState(false);

    function handleClick(answer) {
        props.onClick(answer);
        setHidden(true);
    }

    function isHidden() {
        return props.event.reputation && !hidden &&
        props.event.answered.filter(o => o.address === props.account).length === 0 &&
        utils.getDistance(props.position.latitude, props.position.longitude, props.event.latitude, props.event.longitude) < 0.5;
    }

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
            {isHidden() && (
                <div className="row mt-2">
                    <div className="col-12 d-flex justify-content-center">
                        <Button className="me-2" size="sm" variant="success" onClick={() => handleClick(true)}>Confirm</Button>
                        <Button className="ms-2" size="sm" variant="danger" onClick={() => handleClick(false)}>Reject</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo(EventInfo);