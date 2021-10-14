// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TrafficEvents {
  uint public eventCount = 0;

  struct Event {
    uint id;
    string eventType;
    string date;
    string location;
    uint speed;
    address owner;
  }

  mapping(uint => Event) events;

  function createEvent(string memory _eventType, string memory _date, string memory _location, uint _speed) public {
    events[eventCount] = Event(eventCount, _eventType, _date, _location, _speed, msg.sender);
    eventCount++;
  }

  function getEvent(uint _id) public view returns(uint id, string memory eventType,
  string memory date, string memory location, uint speed, address owner) {
    id = _id;
    eventType = events[_id].eventType;
    date = events[_id].date;
    location = events[_id].location;
    speed = events[_id].speed;
    owner = events[_id].owner;
  }
}
