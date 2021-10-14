const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

mongoose.connect("mongodb://localhost:27017/traffic-thesis", { useNewUrlParser: true })
.then(() => {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use('/', routes);

    app.listen(3200, () => {});
});