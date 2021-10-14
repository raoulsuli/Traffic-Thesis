import './App.css';
import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import TrafficEvents from './contracts/TrafficEvents.json';

function App() {
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState(null);

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
        const ev = await contract.methods.getEvent(i);
        events.push(ev);
      }

      setAddress(accounts[0]);
      setContract(contract);
      setEventCount(eventCount);
      setEvents(events);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  useEffect(() => loadWeb3(), []);

  return (
    <div className="App">
      <Navbar address={address}></Navbar>
    </div>
  );
}

function Navbar({ address }) {
  return (
    <nav className="navbar navbar-dark bg-dark py-0 px-3">
      <div className="navbar-brand">Traffic Events</div>
      <span style={{color: 'white'}}>{address}</span>
    </nav>
  );
}

export default App;
