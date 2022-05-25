var TrafficEvents = artifacts.require("./TrafficEvents.sol");

module.exports = function (deployer) {
  deployer.deploy(TrafficEvents);
};
