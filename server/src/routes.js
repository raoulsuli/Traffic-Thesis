const express = require("express");
const router = express.Router();

const Request = require("./models/Request");
const User = require("./models/User");

const {
  STATUS_CODES,
  isAnyEventNear,
  updateUserReputation,
  updateAllUsersReputation,
} = require("./constants");

// GET

router.get("/requests", async (_, res) => {
  const requests = await Request.find();
  res.status(200).send(requests);
});

// POST

router.post("/request", async (req, res) => {
  const { address, eventType, latitude, longitude, date, speed } = req.body;

  if (
    !address ||
    !eventType ||
    !latitude ||
    !longitude ||
    !date ||
    speed === null
  ) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const requests = await Request.find({ status: STATUS_CODES.PENDING });

  if (isAnyEventNear(requests, latitude, longitude, eventType)) {
    res.status(400).send("Event already exists.");
    return;
  }

  const user = await User.findOne({ address: address });
  let reputation = 5;

  if (user) {
    reputation = user.reputation;
  } else {
    const newUser = new User({
      address: address,
      reputation: 5,
      answers: 0,
    });

    await newUser.save();
  }

  const newRequest = new Request({
    address: address,
    eventType: eventType,
    latitude: latitude,
    longitude: longitude,
    date: date,
    speed: speed,
    status: STATUS_CODES.PENDING,
    reputation: reputation,
    alreadyIn: false,
    answered: [],
  });

  await newRequest.save();
  res.status(200).send();
});

router.post("/updateStatus", async (req, res) => {
  const { id, status, updateReputation } = req.body;

  if (!id || !status || typeof updateReputation !== "boolean") {
    res.status(400).send("Wrong parameters.");
    return;
  }

  if (status !== STATUS_CODES.ACCEPTED && status !== STATUS_CODES.REFUSED) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const request = await Request.findOne({
    _id: id,
    status: STATUS_CODES.PENDING,
  });

  if (!request) {
    res.status(404).send("No request found.");
    return;
  }

  const { address, answered } = request;

  request.status = status;

  if (updateReputation && request.alreadyIn === false) {
    updateUserReputation(status, address);
    updateAllUsersReputation(status, answered);
  }

  await request.save();
  res.status(200).send();
});

router.post("/addAnswer", async (req, res) => {
  const { id, address, answer } = req.body;

  if (!id || !address || typeof answer !== "boolean") {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const request = await Request.findOne({ _id: id });

  if (!request) {
    res.status(404).send("No request found.");
    return;
  }

  if (request.answered.some((req) => req.address === address)) {
    res.status(400).send("Already answered.");
    return;
  }

  const user = await User.findOne({ address: address });
  let reputation = 5;

  if (user) {
    reputation = user.reputation;
    user.answers++;

    await user.save();
  } else {
    const newUser = new User({
      address: address,
      reputation: 5,
      answers: 1,
    });

    await newUser.save();
  }

  request.answered.push({
    address: address,
    answer: answer,
    reputation: reputation,
  });

  await request.save();
  res.status(200).send();
});

router.post("/resetRequest", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude || !date) {
    res.status(400).send("Wrong parameters.");
    return;
  }

  const request = await Request.findOne({
    latitude: latitude,
    longitude: longitude,
    status: STATUS_CODES.ACCEPTED,
  });

  if (!request) {
    res.status(404).send("No request found.");
    return;
  }

  request.status = STATUS_CODES.PENDING;
  request.answered = [];
  request.alreadyIn = true;
  request.date = new Date();

  await request.save();
  res.status(200).send();
});

module.exports = router;
