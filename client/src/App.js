import './App.css';
import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import TrafficEvents from './contracts/TrafficEvents.json';
import Map from './components/map';
import utils from './constants/utils';

function App() {
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [events, setEvents] = useState(null);
  const [requests, setRequests] = useState([]);
  const [queryGiven, setQueryGiven] = useState([]);

  async function loadWeb3() {
    try {
      window.web3 = new Web3(window.ethereum);

      const networkId = await window.web3.eth.net.getId();
      const deployedNetwork = TrafficEvents.networks[networkId];
      const contract = new window.web3.eth.Contract(TrafficEvents.abi, deployedNetwork && deployedNetwork.address);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const eventCount = await contract.methods.eventCount().call();
      const events = [];

      for (let i = 0; i < eventCount; i++) {
        const ev = await contract.methods.getEvent(i).call();
        events.push({
          id: ev.id,
          date: ev.date,
          eventType: ev.eventType,
          latitude: parseFloat(ev.latitude),
          longitude: parseFloat(ev.longitude),
          owner: ev.owner,
          speed: ev.speed
        });
      }

      setAddress(accounts[0]);
      setContract(contract);
      setEvents(events);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  async function updateBlockchain(request) {
    if (contract) {
      const accepts = request.answered.filter(r => r.answer === true);
      const refuses = request.answered.filter(r => r.answer === false);
      if (accepts.length > refuses.length) addToBlockchain(request);
      else if (accepts.length === refuses.length && request.reputation >= 0.5) addToBlockchain(request);
      else updateDatabase(request, -1);
    }
  }

  async function addToBlockchain(request) {
    if (!queryGiven.includes(request._id)) {
      await contract.methods.createEvent(request.eventType, request.date, request.longitude.toString(), request.latitude.toString(), request.speed).send({from: request.address});
      loadWeb3();
      updateDatabase(request, 1);
    }

    setQueryGiven(query => {
      if (!query.includes(request._id)) query.push(request._id);
    });
  }

  async function updateDatabase(request, sign) {
    await fetch(`${utils.API_PATH}/location?address=${request.address.toString()}`)
    .then(data => data.json())
    .then(async data => {
      await fetch(`${utils.API_PATH}/location`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({address: request.address, reputation: Math.min(data.reputation + 0.01 * sign, 100)})
      });
    });
    await fetch(`${utils.API_PATH}/request`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: request._id, status: sign === 1 ? utils.ACCEPTED : utils.REFUSED})
    });
  }

  async function getRequests() {
    await fetch(`${utils.API_PATH}/request`)
    .then(data => data.json())
    .then(data => {
      setRequests(data);
      data.forEach(async d => {
        let date = new Date(d.date);
        date.setMinutes(utils.REQUESTS_ADD_TIME);
        if (new Date() >= date && d.status === utils.PENDING) updateBlockchain(d);
      });
    });
  }

  useEffect(() => {
    loadWeb3();
    getRequests();
    const interval = setInterval(getRequests, utils.REQUESTS_REFRESH_TIME);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
    {events && <Map events={events} requests={requests} account={address} contract={contract}/>}
    </>
  );
}

export default App;
