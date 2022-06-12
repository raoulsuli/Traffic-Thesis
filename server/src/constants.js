const User = require("./models/User");

const STATUS_CODES = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REFUSED: "Refused",
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

const isAnyEventNear = (events, currLat, currLon, currType) => {
  return events.some(({ latitude, longitude, eventType }) => {
    const distance = getDistance(latitude, longitude, currLat, currLon);

    if (distance < 0.05) return true;
    else if (distance < 0.5 && eventType === currType) return true;

    return false;
  });
};

const limitReputation = (reputation) => Math.min(Math.max(reputation, 0), 10);

const getTotalAnswers = async () => {
  const allUsers = await User.find();

  const allAnswers = allUsers.reduce((part, curr) => part + curr.answers, 0);

  return Math.max(allAnswers, 1);
};

const updateUserReputation = async (status, address) => {
  const user = await User.findOne({ address: address });

  const totalAnswers = await getTotalAnswers();

  const reputation = Math.max(user.answers, 1) / totalAnswers;
  const sign = status === STATUS_CODES.ACCEPTED ? 1 : -1;

  user.reputation = limitReputation(user.reputation + reputation * sign);

  await user.save();
};

const updateAllUsersReputation = async (status, answered) => {
  const userAdresses = answered.map(({ address }) => address);

  const users = await User.find({ address: { $in: userAdresses } });

  const totalAnswers = await getTotalAnswers();

  users.forEach(async (user) => {
    const userAnswer = answered.filter(({ address }) => {
      return address === user.address;
    })[0].answer;

    const accepted = status === STATUS_CODES.ACCEPTED;

    const reputation = Math.max(user.answers, 1) / totalAnswers;

    if ((userAnswer && !accepted) || (!userAnswer && accepted)) {
      user.reputation = limitReputation(user.reputation - reputation);
    }

    await user.save();
  });
};

module.exports = {
  STATUS_CODES,
  isAnyEventNear,
  updateUserReputation,
  updateAllUsersReputation,
};
