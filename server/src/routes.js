const express = require("express");
const router = express.Router();
const Location = require('./models/Location');
const Request = require('./models/Request');
const utils = require('./constants/utils');

router.post('/location', async (req, res) => {
    const location = await Location.findOne({ address: req.body.address });
    if (location) {
        location.longitude = req.body.longitude;
        location.latitude = req.body.latitude;
        await location.save();
        res.status(200).send(location);
    } else {
        const newLocation = new Location({
            address: req.body.address,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            reputation: 0.5
        });

        await newLocation.save();
        res.status(200).send(newLocation);
    }
});

router.get('/request', async (req, res) => {
    const requests = await Request.find();
    res.status(200).send(requests);
});

router.post('/request', async (req, res) => {
    const location = await Location.findOne({ address: req.body.address });
    if (location) {
        const requests = await Request.find({ type: req.body.type });
        let found = false;
        if (requests) {
            requests.forEach(r => {
                if (utils.getDistance(r.latitude, r.longitude, req.body.latitude, req.body.longitude) < 0.5) {
                    found = true;
                }
            });
        }
        if (!found) {
            const request = new Request({
                address: req.body.address,
                type: req.body.type,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                date: req.body.date,
                speed: req.body.speed,
                reputation: location.reputation,
                answered: []
            });
            await request.save();
            res.status(200).send('OK!');
        }
    }
});

router.delete('/request', async (req, res) => {
    await Request.deleteOne({ id: req.body.id });
    res.status(200).send('OK!');
});

module.exports = router