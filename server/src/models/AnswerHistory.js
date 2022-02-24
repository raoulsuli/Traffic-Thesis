const mongoose = require('mongoose');

const schema = mongoose.Schema({
    address: String,
    answers: Number
});

module.exports = mongoose.model("ReputationHistory", schema);