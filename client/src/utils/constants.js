import { resetRequest, updateStatus } from "./http";

const EVENT_REFRESH_RATE = 15 * 1000;
const REFUSED_THRESHOLD = 2;

const STATUS_CODES = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REFUSED: "Refused",
};

const EVENT_COLORS = {
  Police: "blue",
  Accident: "red",
  "Traffic Jam": "orange",
  Construction: "yellow",
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const canAddEvent = (events, latitude, longitude, eventType) => {
  return !events.some((ev) => {
    const distance = getDistance(
      latitude,
      longitude,
      ev.latitude,
      ev.longitude
    );

    if (distance < 0.05) return true;
    else if (distance < 0.5 && ev.eventType === eventType) return true;

    return false;
  });
};

const canAnswerEvent = (lat1, lon1, lat2, lon2, answered, address, hidden) => {
  const distance = getDistance(lat1, lon1, lat2, lon2);

  const isNotAnswered = () => {
    if (hidden || !answered) return false;

    if (answered.some((answer) => answer.address === address)) {
      return false;
    }

    return true;
  };

  if (distance < 0.5 && isNotAnswered()) {
    return true;
  }

  return false;
};

const deleteEvent = (event, contract, address, refresh) => {
  const { id, latitude, longitude, date } = event;
  const sessionKey = `ev-${latitude}&${longitude}`;
  const deletedSessionKey = `req-${latitude}&${longitude}`;

  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  sessionStorage.setItem(sessionKey, "true");
  sessionStorage.removeItem(deletedSessionKey);

  contract.methods
    .deleteEvent(id)
    .send({ from: address })
    .then(() => {
      resetRequest({
        latitude: latitude,
        longitude: longitude,
        date: date,
      }).then(() => refresh());
    })
    .catch(() => sessionStorage.removeItem(sessionKey));
};

const updateBlockchain = (request, contract, address) => {
  const { answered, reputation, latitude, longitude } = request;

  const totalValue = answered.reduce((partial, { reputation }) => {
    return partial + reputation;
  }, 0);

  const acceptValue = answered.reduce((partial, { answer, reputation }) => {
    if (answer) {
      return partial + reputation;
    }

    return partial;
  }, 0);

  const refuseValue = totalValue - acceptValue;

  if (acceptValue >= totalValue / 2 + 1) {
    addToBlockchain(request, 1, contract, address);
  } else if (
    acceptValue >= refuseValue - REFUSED_THRESHOLD &&
    reputation >= 5
  ) {
    addToBlockchain(request, 0, contract, address);
  } else {
    updateDatabase(request, -1, `ev-${latitude}&${longitude}`);
  }
};

const addToBlockchain = (request, reputation, contract, address) => {
  const { eventType, latitude, longitude, speed } = request;
  const sessionKey = `req-${latitude}&${longitude}`;
  const deletedSessionKey = `ev-${latitude}&${longitude}`;

  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  sessionStorage.setItem(sessionKey, "true");
  sessionStorage.removeItem(deletedSessionKey);

  contract.methods
    .createEvent(
      eventType,
      (new Date()).toString(),
      longitude.toString(),
      latitude.toString(),
      speed
    )
    .send({ from: address })
    .then(() => updateDatabase(request, reputation))
    .catch(() => updateDatabase(request, -1, sessionKey));
};

const updateDatabase = async ({ _id }, reputation, deletedSessionKey) => {
  const status = reputation >= 0 ? STATUS_CODES.ACCEPTED : STATUS_CODES.REFUSED;
  const updateReputation = reputation !== 0;

  if (reputation === -1) {
    sessionStorage.removeItem(deletedSessionKey);
  }

  await updateStatus({
    id: _id,
    status: status,
    updateReputation: updateReputation,
  });
};

export {
  EVENT_REFRESH_RATE,
  STATUS_CODES,
  EVENT_COLORS,
  getDistance,
  canAddEvent,
  canAnswerEvent,
  deleteEvent,
  updateBlockchain,
};
