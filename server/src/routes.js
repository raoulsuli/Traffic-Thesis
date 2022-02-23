const express = require("express");
const router = express.Router();
const Location = require('./models/Location');
const Request = require('./models/Request');
const utils = require('./constants/utils');

router.get('/location', async (req, res) => {
    const location = await Location.findOne({ address: req.query.address });
    res.status(200).send(location || {});
});

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
            reputation: 5
        });

        await newLocation.save();
        res.status(200).send(newLocation);
    }
});

router.put('/location', async (req, res) => {
    const location = await Location.findOne({ address: req.body.address });
    if (location) {
        location.reputation = req.body.reputation;

        await location.save();
        res.status(200).send(location);
    } else res.status(404).send('Wrong address');
});

router.get('/request', async (req, res) => {
    const requests = await Request.find();
    res.status(200).send(requests);
});

router.post('/request', async (req, res) => {
    const location = await Location.findOne({ address: req.body.address });
    if (location) {
        const typeRequests = await Request.find({ eventType: req.body.type });
        const requests = await Request.find();
        let found = false;
        if (typeRequests) {
            typeRequests.forEach(r => {
                if (utils.getDistance(r.latitude, r.longitude, req.body.latitude, req.body.longitude) < 0.5) {
                    found = true;
                }
            });

            requests.forEach(r => {
                if (utils.getDistance(r.latitude, r.longitude, req.body.latitude, req.body.longitude) < 0.1) {
                    found = true;
                }
            });
        }
        if (!found) {
            const request = new Request({
                address: req.body.address,
                eventType: req.body.type,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                date: req.body.date,
                speed: req.body.speed,
                reputation: location.reputation,
                status: utils.PENDING,
                already_in: false,
                answered: []
            });
            await request.save();
            res.status(200).send('OK!');
        }
    }
});

router.put('/request', async (req, res) => {
    const request = await Request.findOne({ id: req.body.id });
    if (request) {
        let change = false;
        if (req.body.status) {
            request.status = req.body.status;
            change = true;
        }
        if (req.body.answered) {
            request.answered.push(req.body.answered);
            change = true;
        }
        if (change) await request.save();
        res.status(200).send(request);
    }
});

router.post('/deleteEvent', async (req, res) => {
    const { address, eventType, longitude, latitude, date } = req.body;
    const request = await Request
    .findOne({ 
        address: address.toLowerCase(),
        eventType: eventType,
        longitude: longitude,
        latitude: latitude,
        date: date
    });
    if (request) {
        request.status = utils.PENDING;
        request.answered = [];
        request.already_in = true;
        await request.save();
        res.status(200).send(request);
    }
});

router.delete('/request', async (req, res) => {
    await Request.deleteOne({ id: req.body.id });
    res.status(200).send('OK!');
});

module.exports = router