const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Location = require("../models/Location");
const AnswerHistory = require("../models/AnswerHistory");

const {
  objectHasKeys,
  includesStatusCode,
  getDistance,
  STATUS_CODES,
} = require("../constants/utils");

// GET

router.get("/request", async (_, res) => {
  const requests = await Request.find();
  res.status(200).send(requests);
});

// POST

router.post("/request", async (req, res) => {
  const { address, type, latitude, longitude, date, speed } = req.body;

  if (!address || !type || !latitude || !longitude || !date || speed === null) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const location = await Location.findOne({ address: address });

  if (!location) {
    res.status(404).send("No location found.");
    return;
  }

  const requests = await Request.find();

  const conflictRequest = requests.some((req) => {
    const distanceTarget = getDistance(
      req.latitude,
      req.longitude,
      latitude,
      longitude
    );
    if (
      distanceTarget < 0.05 ||
      (req.eventType === type && distanceTarget < 0.5)
    )
      return true;
  });

  if (conflictRequest) {
    res.status(400).send("Event already exists.");
    return;
  }

  const request = new Request({
    address: address,
    eventType: type,
    longitude: longitude,
    latitude: latitude,
    date: date,
    speed: speed,
    reputation: location.reputation,
    status: STATUS_CODES.PENDING,
    already_in: false,
    answered: [],
  });
  await request.save();
  res.status(200).send();
});

router.post("/deleteEvent", async (req, res) => {
  const { address, type, longitude, latitude, date } = req.body;

  if (!address || !type || !longitude || !latitude || !date) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const request = await Request.findOne({
    address: address.toLowerCase(),
    eventType: type,
    longitude: longitude,
    latitude: latitude,
    date: date,
  });

  if (!request) {
    res.status(404).send("No request found.");
    return;
  }

  request.status = STATUS_CODES.PENDING;
  request.answered = [];
  request.already_in = true;
  request.date = new Date();
  await request.save();
  res.status(200).send();
});

//PUT

router.put("/request", async (req, res) => {
  const { id, status, answered } = req.body;

  if (!id || (!status && !answered)) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  if (
    (status && !includesStatusCode(status)) ||
    (answered && !objectHasKeys(answered, ["address", "answer"]))
  ) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const request = await Request.findOne({ _id: id });

  if (!request) {
    res.status(404).send("No request found.");
    return;
  }

  request.status = status ?? request.status;

  if (answered) {
    if (
      request.answered.filter((r) => r.address == answered.address).length !== 0
    ) {
      res.status(400).send("Already answered.");
      return;
    }

    request.answered.push(answered);

    const answerHistory = await AnswerHistory.findOne({
      address: answered.address,
    });

    if (answerHistory) {
      answerHistory.answers++;

      await answerHistory.save();
    } else {
      const newAnswerHistory = new AnswerHistory({
        address: answered.address,
        answers: 1,
      });

      await newAnswerHistory.save();
    }
  }

  await request.save();
  res.status(200).send();
});

// DELETE

router.delete("/request", async (req, res) => {
  const { id } = req.body;

  await Request.deleteOne({ _id: id });
  res.status(200).send();
});

module.exports = router;
