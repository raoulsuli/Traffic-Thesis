const mongoose = require('mongoose');

const schema = mongoose.Schema({
    address: String,
    type: String,
    longitude: Number,
    latitude: Number,
    date: Date,
    speed: Number,
    reputation: Number,
    answered: [{address: String, answer: Boolean}]
});

module.exports = mongoose.model("Request", schema);