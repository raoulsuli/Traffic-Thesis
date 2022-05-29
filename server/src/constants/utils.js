const STATUS_CODES = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REFUSED: "Refused",
};

const includesStatusCode = (status) =>
  Object.values(STATUS_CODES).includes(status);

const objectHasKeys = (object, keys) => {
  const objKeys = Object.keys(object);

  keys.forEach((k) => {
    if (!objKeys.includes(k)) return false;
  });

  return true;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

module.exports = {
  STATUS_CODES,
  includesStatusCode,
  objectHasKeys,
  getDistance,
};
