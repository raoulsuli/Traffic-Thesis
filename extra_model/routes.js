router.put('/updateReputation', async (req, res) => {
    const location = await Location.findOne({ address: req.body.address });
    if (location) {
        location.reputation = req.body.reputation;

        await location.save();
        res.status(200).send(location);
    } else res.status(404).send('Wrong address');
});
