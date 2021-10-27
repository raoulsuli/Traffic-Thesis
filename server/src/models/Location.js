const mongoose = require('mongoose');

const schema = mongoose.Schema({
    address: String,
    longitude: Number,
    latitude: Number,
    reputation: Number
});

module.exports = mongoose.model("Location", schema);