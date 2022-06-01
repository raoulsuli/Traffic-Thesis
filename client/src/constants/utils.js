module.exports = {
  API_PATH: "http://localhost:3200",
  REQUESTS_REFRESH_TIME: 15000, // COMMENT PENTRU TESTE
  REQUESTS_ADD_TIME: 5, // COMMENT PENTRU TESTE
  EXPIRATION_HOURS: 1, // COMMENT PENTRU TESTE
  REPUTATION_ERROR_THRESHOLD: 2, // COMMENT PENTRU TESTE
  BOTS_NUMBER: 3, // COMMENT PENTRU TESTE
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REFUSED: "Refused",
  getDistance: (lat1, lon1, lat2, lon2) => {
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
  },
  httpRequest: (path, method = "GET", body) => {
    return fetch(`${module.exports.API_PATH}${path}`, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
