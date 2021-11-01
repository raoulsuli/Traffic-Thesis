const mongoose = require('mongoose');

const schema = mongoose.Schema({
    address: String,
    eventType: String,
    longitude: Number,
    latitude: Number,
    date: Date,
    speed: Number,
    reputation: Number,
    status: String,
    answered: [{address: String, answer: Boolean}]
});

module.exports = mongoose.model("Request", schema);