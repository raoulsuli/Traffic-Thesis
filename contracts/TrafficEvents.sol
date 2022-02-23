// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TrafficEvents {
  uint public eventCount = 0;

  struct Event {
    uint id;
    string eventType;
    string date;
    string longitude;
    string latitude;
    uint speed;
    address owner;
  }

  mapping(uint => Event) events;

  function createEvent(string memory _eventType, string memory _date, string memory _longitude,
  string memory _latitude, uint _speed) public {
    events[eventCount] = Event(eventCount, _eventType, _date, _longitude, _latitude, _speed, msg.sender);
    eventCount++;
  }

  function getEvent(uint _id) public view returns(uint id, string memory eventType,
  string memory date, string memory longitude, string memory latitude, uint speed, address owner) {
    id = _id;
    eventType = events[_id].eventType;
    date = events[_id].date;
    longitude = events[_id].longitude;
    latitude = events[_id].latitude;
    speed = events[_id].speed;
    owner = events[_id].owner;
  }

  function deleteEvent(uint _id) public {
    for (uint i = _id; i < eventCount - 1; i++) {
      events[i] = events[i + 1];
    }
    delete events[eventCount - 1];
    eventCount--;
  }
}
