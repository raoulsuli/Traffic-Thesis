const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");
const locationRoutes = require("./routes/locationRoutes");

mongoose
  .connect("mongodb://localhost:27017/traffic-thesis", {
    useNewUrlParser: true,
  })
  .then(() => {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
    app.use("/", [requestRoutes, locationRoutes]);

    app.listen(3200, () => {});
  });
