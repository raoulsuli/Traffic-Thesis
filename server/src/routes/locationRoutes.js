const express = require("express");
const router = express.Router();
const Location = require("../models/Location");
const AnswerHistory = require("../models/AnswerHistory");

router.post("/location", async (req, res) => {
  const { address, longitude, latitude } = req.body;

  if (!address || !longitude || !latitude) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const location = await Location.findOne({ address: address });

  if (location) {
    location.longitude = longitude;
    location.latitude = latitude;

    await location.save();
    res.status(200).send();
  } else {
    const newLocation = new Location({
      address: address,
      longitude: longitude,
      latitude: latitude,
      reputation: 5,
    });

    await newLocation.save();
    res.status(200).send();
  }
});

router.put("/location", async (req, res) => {
  const { address, reputationCoeff } = req.body;

  if (!address || !reputationCoeff) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const location = await Location.findOne({ address: address });

  if (!location) {
    res.status(404).send("No location found.");
    return;
  }

  const answerHistory = await AnswerHistory.findOne({
    address: address,
  });

  const allAnswers = await AnswerHistory.find();
  const totalAnswers = allAnswers.reduce(
    (partial, curr) => partial + curr.answers,
    1
  );

  let reputation = 1 / totalAnswers;

  if (answerHistory) {
    reputation *= answerHistory.answers;
  }

  location.reputation += reputation * reputationCoeff;
  location.reputation = Math.max(0, location.reputation);
  location.reputation = Math.min(10, location.reputation);

  await location.save();
  res.status(200).send();
});

module.exports = router;
