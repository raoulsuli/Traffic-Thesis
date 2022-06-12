const mongoose = require("mongoose");

const schema = mongoose.Schema({
  address: String,
  eventType: String,
  latitude: Number,
  longitude: Number,
  date: Date,
  speed: Number,
  status: String,
  reputation: Number,
  alreadyIn: Boolean,
  answered: [{ address: String, answer: Boolean, reputation: Number }],
});

module.exports = mongoose.model("Request", schema);
