const mongoose = require("mongoose");

const schema = mongoose.Schema({
  address: String,
  reputation: Number,
  answers: Number,
});

module.exports = mongoose.model("User", schema);
